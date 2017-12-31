class Delegator {
  constructor() {
    this.to = null;
  }

  delegate(...args) {
    return this.to ? this.to(...args) : undefined;
  }

  set(to) {
    this.to = to;
  }

  unset() {
    this.to = null;
  }
}

module.exports = Delegator;
