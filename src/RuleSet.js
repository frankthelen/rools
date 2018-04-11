const assert = require('assert');
const md5 = require('md5');
const uniqueid = require('uniqueid');
const Action = require('./Action');
const Premise = require('./Premise');
const Rule = require('./Rule');

class RuleSet {
  constructor() {
    this.actions = [];
    this.premises = [];
    this.premisesByHash = {};
    this.nextActionId = uniqueid('a');
    this.nextPremiseId = uniqueid('p');
    this.actionsByActivationGroup = {}; // hash
  }

  register(rule) {
    assert(rule instanceof Rule, 'rule must be an instance of "Rule"');
    // action
    const action = new Action({
      ...rule,
      id: this.nextActionId(),
    });
    this.actions.push(action);
    // extend
    const walked = new Set(); // cycle check
    const whens = new Set();
    const walker = (node) => {
      if (walked.has(node)) return; // cycle
      walked.add(node);
      node.when.forEach((w) => { whens.add(w); });
      node.extend.forEach((r) => { walker(r); }); // recursion
    };
    walker(rule);
    // premises
    [...whens].forEach((when, index) => {
      const hash = md5(when.toString()); // is function already introduced by other rule?
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
    // activation group
    const { activationGroup } = rule;
    if (activationGroup) {
      let group = this.actionsByActivationGroup[activationGroup];
      if (!group) {
        group = [];
        this.actionsByActivationGroup[activationGroup] = group;
      }
      group.push(action);
    }
  }
}

module.exports = RuleSet;
