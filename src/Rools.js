const assert = require('assert');
const md5 = require('md5');
const actionId = require('uniqueid')('a');
const premiseId = require('uniqueid')('p');
const Logger = require('./Logger');
const Delegator = require('./Delegator');
const observe = require('./observe');

class Rools {
  constructor({ logging } = {}) {
    this.actions = [];
    this.premises = [];
    this.premisesByHash = {};
    this.maxSteps = 100;
    this.logger = new Logger(logging);
  }

  register(...rules) {
    rules.forEach((rule) => {
      this.assertRule(rule);
      const action = {
        id: actionId(),
        name: rule.name,
        then: rule.then,
        priority: rule.priority || 0,
        final: rule.final || false,
        premises: [],
      };
      this.actions.push(action);
      const whens = Array.isArray(rule.when) ? rule.when : [rule.when];
      whens.forEach((when) => {
        const hash = md5(when); // is function already introduced by other rule?
        let premise = this.premisesByHash[hash];
        if (!premise) { // create new premise
          premise = {
            id: premiseId(),
            name: rule.name,
            when,
          };
          this.premisesByHash[hash] = premise; // add to hash
          this.premises.push(premise); // add to premises
        }
        action.premises.push(premise); // add to action
      });
    });
  }

  assertRule(rule) { // eslint-disable-line class-methods-use-this
    assert(rule.name, '"rule.name" is required');
    assert(rule.when, `"rule.when" is required "${rule.name}"`);
    assert(rule.then, `"rule.then" is required "${rule.name}"`);
  }

  evaluate(facts) {
    // init
    const memory = {}; // working memory
    this.actions.forEach((action) => {
      memory[action.id] = { ready: false, fired: false };
    });
    this.premises.forEach((premise) => {
      memory[premise.id] = { value: undefined };
    });
    const delegator = new Delegator();
    const proxy = observe(facts, segment => delegator.delegate(segment));
    // match-resolve-act cycle
    for (
      let step = 0;
      step < this.maxSteps && !this.evaluateStep(proxy, delegator, memory, step).next().done;
      step += 1
    ) ;
    // for convenience only
    return facts;
  }

  * evaluateStep(facts, delegator, memory, step) {
    this.logger.log({ type: 'debug', message: `evaluate step ${step}` });
    // evaluate premises
    this.premises.forEach((premise) => {
      try {
        delegator.set((segment) => {
          this.logger.log({ type: 'debug', message: `read "${segment}"`, rule: premise.name });
        });
        memory[premise.id].value = premise.when(facts);
      } catch (error) {
        memory[premise.id].value = undefined;
        this.logger.log({
          type: 'error', message: 'exception in when clause', rule: premise.name, error,
        });
      } finally {
        delegator.unset();
      }
    });
    // evaluate actions
    const actionsNotFired = this.actions.filter(action => !memory[action.id].fired); // refraction
    actionsNotFired.forEach((action) => {
      const num = action.premises.length;
      const tru = action.premises.filter(premise => memory[premise.id].value).length;
      memory[action.id].ready = tru === num; // mark ready
    });
    // create agenda
    const actionsToBeFired = actionsNotFired.filter(action => memory[action.id].ready);
    const action = this.evaluateSelect(actionsToBeFired);
    if (!action) {
      this.logger.log({ type: 'debug', message: 'evaluation complete' });
      return; // done
    }
    // fire action
    this.logger.log({ type: 'debug', message: 'fire rule', rule: action.name });
    memory[action.id].fired = true; // mark fired
    try {
      delegator.set((segment) => {
        this.logger.log({ type: 'debug', message: `write "${segment}"`, rule: action.name });
      });
      action.then(facts); // fire!
    } catch (error) {
      this.logger.log({
        type: 'error', message: 'exception in then clause', rule: action.name, error,
      });
    } finally {
      delegator.unset();
    }
    if (action.final) {
      this.logger.log({
        type: 'debug', message: 'evaluation stop after final rule', rule: action.name,
      });
      return; // done
    }
    yield; // not yet done
  }

  evaluateSelect(actions) {
    if (actions.length === 0) {
      return undefined; // none
    }
    if (actions.length === 1) {
      return actions[0]; // the one and only
    }
    // conflict resolution
    const prios = actions.map(action => action.priority);
    const highestPrio = Math.max(...prios);
    const actionsWithPrio = actions.filter(action => action.priority === highestPrio);
    this.logger.log({ type: 'debug', message: 'conflict resolution by priority' });
    return actionsWithPrio[0];
  }
}

module.exports = Rools;
