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
    try {
      const thenable = this.then(facts); // >>> fire action!
      return thenable && thenable.then ? thenable : Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = Action;
