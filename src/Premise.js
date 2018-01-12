class Premise {
  constructor({
    id, name, when,
  }) {
    this.id = id;
    this.name = name; // for logging only
    this.when = when;
    this.actions = [];
  }

  add(action) {
    this.actions.push(action);
  }
}

module.exports = Premise;
