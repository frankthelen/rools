const assert = require('assert');
const actionId = require('uniqueid')('a');
const premiseId = require('uniqueid')('p');

class Rools {
  constructor({ debug = false } = {}) {
    this.debug = debug;
    this.actions = [];
    this.premises = [];
    this.maxSteps = 100;
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
    this.log(`step ${step}`);
    // evaluate premises
    this.premises.forEach((premise) => {
      try {
        memory[premise.id] = premise.when(facts);
      } catch (error) {
        memory[premise.id] = undefined;
        this.error(`error in "when" clause of "${premise.name}"`, error);
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
      this.log('evaluation complete');
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
      this.log(`conflict resolution by priority: [${prios}]`);
      return actionsWithPrio[0];
    };
    const action = select(actionsToBeFired);
    this.log(`firing "${action.name}"`);
    memory[action.id].fired = true;
    try {
      action.then(facts);
    } catch (error) {
      this.error(`error in "then" clause of "${action.name}"`, error);
    }
    if (action.final) {
      this.log(`evaluation stopped after final rule "${action.name}"`);
      return; // done
    }
    yield; // not yet done
  }

  log(msg) {
    if (!this.debug) return;
    console.log(`# ${msg}`); // eslint-disable-line no-console
  }

  error(msg, error) { // eslint-disable-line class-methods-use-this
    console.error(`# ${msg}`, error); // eslint-disable-line no-console
  }
}

module.exports = Rools;
