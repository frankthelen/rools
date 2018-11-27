class Action {
  constructor({
    id, name, then, priority, final, activationGroup,
  }) {
    this.id = id;
    this.name = name; // for logging only
    this.then = then;
    this.priority = priority;
    this.final = final;
    this.activationGroup = activationGroup;
    this.premises = [];
  }

  add(premise) {
    this.premises.push(premise);
  }

  async fire(facts) {
    const thenable = this.then(facts); // >>> fire action!
    return thenable && thenable.then ? thenable : undefined;
  }
}

module.exports = Action;
