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
            actions: [],
          };
          this.premisesByHash[hash] = premise;
          this.premises.push(premise);
        }
        action.premises.push(premise); // action ->> premises
        premise.actions.push(action); // premise ->> actions
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
    const activeSegments = new Set();
    const premisesBySegment = {}; // hash
    // match-resolve-act cycle
    for (
      let step = 0;
      step < this.maxSteps &&
        !this.evaluateStep(proxy, delegator, memory, activeSegments, premisesBySegment, step)
          .next().done;
      step += 1
    ) ;
    // for convenience only
    return facts;
  }

  * evaluateStep(facts, delegator, memory, activeSegments, premisesBySegment, step) {
    this.logger.log({ type: 'debug', message: `evaluate step ${step}` });
    // evaluate premises
    const premisesToEvaluate = new Set(); // agenda
    if (step === 0) {
      this.premises.forEach((premise) => { premisesToEvaluate.add(premise); });
    } else {
      activeSegments.forEach((segment) => {
        const premises = premisesBySegment[segment] || [];
        premises.forEach((premise) => { premisesToEvaluate.add(premise); });
      });
    }
    premisesToEvaluate.forEach((premise) => {
      try {
        delegator.set((segment) => {
          this.logger.log({ type: 'debug', message: `read "${segment}"`, rule: premise.name });
          let premises = premisesBySegment[segment];
          if (!premises) {
            premises = new Set();
            premisesBySegment[segment] = premises;
          }
          premises.add(premise);
        });
        memory[premise.id].value = premise.when(facts); // evaluate!
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
    const actionsToEvaluate = this.actions.filter(action => !memory[action.id].fired); // refraction
    actionsToEvaluate.forEach((action) => {
      const num = action.premises.length;
      const tru = action.premises.filter(premise => memory[premise.id].value).length;
      memory[action.id].ready = tru === num; // mark ready
    });
    // conflict set
    const actionsToBeFired = actionsToEvaluate.filter(action => memory[action.id].ready);
    const action = this.evaluateSelect(actionsToBeFired);
    if (!action) {
      this.logger.log({ type: 'debug', message: 'evaluation complete' });
      return; // done
    }
    // fire action
    this.logger.log({ type: 'debug', message: 'fire rule', rule: action.name });
    memory[action.id].fired = true; // mark fired
    try {
      activeSegments.clear();
      delegator.set((segment) => {
        this.logger.log({ type: 'debug', message: `write "${segment}"`, rule: action.name });
        activeSegments.add(segment);
      });
      action.then(facts); // fire!
    } catch (error) {
      this.logger.log({
        type: 'error', message: 'exception in then clause', rule: action.name, error,
      });
    } finally {
      delegator.unset();
    }
    // final rule
    if (action.final) {
      this.logger.log({
        type: 'debug', message: 'evaluation stop after final rule', rule: action.name,
      });
      return; // done
    }
    // next step
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
