const assert = require('assert');
const md5 = require('md5');
const actionId = require('uniqueid')('a');
const premiseId = require('uniqueid')('p');
const observer = require('./observer');

class Rools {
  constructor({
    logErrors = true, logDebug = false, logDelegate = null,
  } = { logErrors: true, logDebug: false, logDelegate: null }) {
    this.actions = [];
    this.premises = [];
    this.premisesByHash = {};
    this.maxSteps = 100;
    this.logErrors = logErrors;
    this.logDebug = logDebug;
    this.logDelegate = logDelegate;
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
    const proxy = observer(facts, (segment) => {
      console.log(segment);
    });
    const memory = {}; // working memory
    this.actions.forEach((action) => {
      memory[action.id] = { ready: false, fired: false };
    });
    this.premises.forEach((premise) => {
      memory[premise.id] = { value: undefined, segments: [] };
    });
    // match-resolve-act cycle
    for (
      let step = 0;
      step < this.maxSteps && !this.evaluateStep(proxy, memory, step).next().done;
      step += 1
    ) ;
    // for convenience only
    return facts;
  }

  * evaluateStep(facts, memory, step) {
    this.log({ type: 'debug', message: `evaluate step ${step}` });
    // evaluate premises
    this.premises.forEach((premise) => {
      try {
        memory[premise.id].value = premise.when(facts);
      } catch (error) {
        memory[premise.id].value = undefined;
        this.log({
          type: 'error', message: 'exception in when clause', rule: premise.name, error,
        });
      }
    });
    // evaluate actions
    const actionsNotFired = this.actions.filter(action => !memory[action.id].fired); // refraction
    actionsNotFired.forEach((action) => {
      const num = action.premises.length;
      const tru = action.premises.filter(premise => memory[premise.id].value).length;
      memory[action.id].ready = tru === num; // mark ready
    });
    // fire action
    const actionsToBeFired = actionsNotFired.filter(action => memory[action.id].ready);
    const action = this.evaluateSelect(actionsToBeFired);
    if (!action) {
      this.log({ type: 'debug', message: 'evaluation complete' });
      return; // done
    }
    this.log({ type: 'debug', message: 'fire rule', rule: action.name });
    memory[action.id].fired = true; // mark fired
    try {
      action.then(facts); // fire!
    } catch (error) {
      this.log({
        type: 'error', message: 'exception in then clause', rule: action.name, error,
      });
    }
    if (action.final) {
      this.log({ type: 'debug', message: 'evaluation stop after final rule', rule: action.name });
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
    this.log({ type: 'debug', message: 'conflict resolution by priority' });
    return actionsWithPrio[0];
  }

  log({ type, ...others }) {
    if (type === 'error' && !this.logErrors) return;
    if (type === 'debug' && !this.logDebug) return;
    if (this.logDelegate) {
      this.logDelegate({ type, ...others });
    } else {
      this.logDefault({ type, ...others });
    }
  }

  logDefault({ message, rule, error }) { // eslint-disable-line class-methods-use-this
    const msg = rule ? `# ${message} "${rule}"` : `# ${message}`;
    if (error) {
      console.error(msg, error); // eslint-disable-line no-console
    } else {
      console.log(msg); // eslint-disable-line no-console
    }
  }
}

module.exports = Rools;
