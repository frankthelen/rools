class Rools {
  constructor() {
    this.actions = [];
    this.premises = [];
    this.maxIterations = 100;
  }

  register(...rules) {
    rules.forEach((rule) => {
      const action = {
        name: rule.name,
        then: rule.then,
        premises: [],
        ready: false, // ready to fire
        fired: false, // not yet fired
      };
      this.actions.push(action);
      const whens = Array.isArray(rule.when) ? rule.when : [rule.when];
      whens.forEach((when) => {
        const premise = {
          when,
          value: undefined, // not yet evaluated
        };
        action.premises.push(premise);
        this.premises.push(premise);
      });
    });
  }

  execute(facts) {
    this.actions.forEach((action) => { // init
      action.ready = false;
      action.fired = false;
    });
    for (let iteration = 0; iteration < this.maxIterations; iteration += 1) {
      this.premises.forEach((premise) => {
        premise.value = premise.when(facts);
      });
      this.actions.filter(action => !action.fired).forEach((action) => {
        const num = action.premises.length;
        const tru = action.premises.filter(premise => premise.value).length;
        action.ready = tru === num;
      });
      const actionsToBeFired = this.actions.filter(action => !action.fired && action.ready);
      if (actionsToBeFired.length === 0) {
        break; // for --> all done
      }
      if (actionsToBeFired.length > 1) {
        console.error('conflict resolution missing!');
      }
      actionsToBeFired.forEach((action) => {
        console.log(`firing ${action.name}`);
        action.fired = true;
        action.then(facts);
      });
      iteration += 1;
    }
    return facts;
  }
}

module.exports = Rools;
