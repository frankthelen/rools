const md5 = require('md5');
const uniqueid = require('uniqueid');
const Rule = require('./Rule');
const Action = require('./Action');
const Premise = require('./Premise');

class RuleSet {
  constructor() {
    this.actions = [];
    this.premises = [];
    this.premisesByHash = {};
    this.nextActionId = uniqueid('a');
    this.nextPremiseId = uniqueid('p');
  }

  register(r) {
    const rule = new Rule(r);
    const action = new Action({
      ...rule,
      id: this.nextActionId(),
    });
    this.actions.push(action);
    rule.when.forEach((when, index) => {
      const hash = md5(when); // is function already introduced by other rule?
      let premise = this.premisesByHash[hash];
      if (!premise) { // create new premise
        premise = new Premise({
          ...rule,
          id: this.nextPremiseId(),
          name: `${rule.name} / ${index}`,
          when,
        });
        this.premisesByHash[hash] = premise;
        this.premises.push(premise);
      }
      action.add(premise); // action ->> premises
      premise.add(action); // premise ->> actions
    });
  }
}

module.exports = RuleSet;
