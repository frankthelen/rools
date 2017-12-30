const assert = require('assert');
const actionId = require('uniqueid')('a');
const premiseId = require('uniqueid')('p');

class Rools {
  constructor({
    logErrors = true, logDebug = false, logDelegate = null,
  } = { logErrors: true, logDebug: false, logDelegate: null }) {
    this.actions = [];
    this.premises = [];
    this.maxSteps = 100;
    this.logErrors = logErrors;
    this.logDebug = logDebug;
    this.logDelegate = logDelegate;
  }

  register(...rules) {
    rules.forEach((rule) => {
      assert(rule.name, '`rule.name` is required');
      assert(rule.when, '`rule.when` is required');
      assert(rule.then, '`rule.then` is required');
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
        const premise = {
          id: premiseId(),
          name: rule.name,
          when,
        };
        action.premises.push(premise);
        this.premises.push(premise);
      });
    });
  }

  evaluate(facts) {
    // init
    const memory = {}; // working memory
    this.actions.forEach((action) => {
      memory[action.id] = { ready: false, fired: false };
    });
    // match-resolve-act cycle
    for (
      let step = 0;
      step < this.maxSteps && !this.evaluateStep(facts, memory, step).next().done;
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
        memory[premise.id] = premise.when(facts);
      } catch (error) {
        memory[premise.id] = undefined;
        this.log({
          type: 'error', message: 'exception in when clause', rule: premise.name, error,
        });
      }
    });
    // evaluate actions
    const actionsNotFired = this.actions.filter(action => !memory[action.id].fired); // refraction
    actionsNotFired.forEach((action) => {
      const num = action.premises.length;
      const tru = action.premises.filter(premise => memory[premise.id]).length;
      memory[action.id].ready = tru === num;
    });
    // fire action
    const actionsToBeFired = actionsNotFired.filter(action => memory[action.id].ready);
    if (actionsToBeFired.length === 0) {
      this.log({ type: 'debug', message: 'evaluation complete' });
      return; // done
    }
    // conflict resolution
    const select = (actions) => {
      if (actions.length === 1) {
        return actions[0];
      }
      // priority
      const prios = actions.map(action => action.priority);
      const highestPrio = Math.max(...prios);
      const actionsWithPrio = actions.filter(action => action.priority === highestPrio);
      this.log({ type: 'debug', message: 'conflict resolution by priority' });
      return actionsWithPrio[0];
    };
    const action = select(actionsToBeFired);
    this.log({ type: 'debug', message: 'fire rule', rule: action.name });
    memory[action.id].fired = true;
    try {
      action.then(facts);
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

  log({
    type, message, rule, error,
  }) {
    if (type === 'error' && !this.logErrors) return;
    if (type === 'debug' && !this.logDebug) return;
    if (this.logDelegate) {
      this.logDelegate({
        type, message, rule, error,
      });
      return;
    }
    /* eslint-disable no-console */
    if (error && rule) {
      console.error(`# ${message} "${rule}"`, error);
    } else if (error) {
      console.error(`# ${message}`, error);
    } else if (rule) {
      console.log(`# ${message} "${rule}"`);
    } else {
      console.log(`# ${message}`);
    }
    /* eslint-enable no-console */
  }
}

module.exports = Rools;
