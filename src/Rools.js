const actionId = require('uniqueid')('action-');
const premiseId = require('uniqueid')('premise-');

class Rools {
  constructor({ debug = false } = {}) {
    this.debug = debug;
    this.actions = [];
    this.premises = [];
    this.maxIterations = 100;
  }

  register(...rules) {
    rules.forEach((rule) => {
      const action = {
        id: actionId(),
        name: rule.name,
        then: rule.then,
        premises: [],
      };
      this.actions.push(action);
      const whens = Array.isArray(rule.when) ? rule.when : [rule.when];
      whens.forEach((when) => {
        const premise = {
          id: premiseId(),
          when,
        };
        action.premises.push(premise);
        this.premises.push(premise);
      });
    });
  }

  execute(facts) {
    // init
    const store = {};
    this.actions.forEach((action) => {
      store[action.id] = { ready: false, fired: false };
    });
    // match-resolve-act cycles
    for (let cycle = 0; cycle < this.maxIterations; cycle += 1) {
      this.log(`cycle ${cycle}`);
      // calculate premises
      this.premises.forEach((premise) => {
        store[premise.id] = premise.when(facts); // TODO add some error handling
      });
      // calculate actions
      const actionsNotFired = this.actions.filter(action => !store[action.id].fired);
      actionsNotFired.forEach((action) => {
        const num = action.premises.length;
        const tru = action.premises.filter(premise => store[premise.id]).length;
        store[action.id].ready = tru === num;
      });
      const actionsToBeFired = this.actions.filter(action =>
        !store[action.id].fired && store[action.id].ready); // refraction!
      if (actionsToBeFired.length === 0) {
        this.log('execution complete');
        break; // for
      }
      if (actionsToBeFired.length > 1) {
        this.log('conflict resolution');
        // TODO add conflict resolution: priority (salience), specificity, actuality
      }
      actionsToBeFired.forEach((action) => {
        this.log(`firing: ${action.name}`);
        store[action.id].fired = true;
        action.then(facts); // TODO add some error handling
      });
    }
    return facts;
  }

  log(msg) {
    if (this.debug) {
      console.log(`# ${msg}`); // eslint-disable-line no-console
    }
  }
}

module.exports = Rools;
