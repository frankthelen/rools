const Action = require('./Action');

class WorkingMemory {
  constructor({ actions = [], premises = [] }) {
    this.actionsById = {}; // hash
    this.premisesById = {}; // hash
    actions.forEach((action) => {
      this.actionsById[action.id] = { ready: false, fired: false };
    });
    premises.forEach((premise) => {
      this.premisesById[premise.id] = { value: undefined };
    });
    this.dirtySegments = new Set();
    this.premisesBySegment = {}; // hash
  }

  getState(object) {
    const { id } = object;
    return object instanceof Action ? this.actionsById[id] : this.premisesById[id];
  }

  clearDirtySegments() {
    this.dirtySegments.clear();
  }

  getDirtyPremises() {
    const premises = new Set();
    this.dirtySegments.forEach((segment) => {
      const dirtyPremises = this.premisesBySegment[segment] || [];
      dirtyPremises.forEach((premise) => {
        premises.add(premise);
      });
    });
    return [...premises];
  }

  segmentWrite(segment) {
    this.dirtySegments.add(segment);
  }

  segmentRead(segment, premise) {
    let premises = this.premisesBySegment[segment];
    if (!premises) {
      premises = new Set();
      this.premisesBySegment[segment] = premises;
    }
    premises.add(premise); // might grow over time with "hidden" conditions
  }
}

module.exports = WorkingMemory;
