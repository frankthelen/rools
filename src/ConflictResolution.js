const intersection = require('lodash/intersection');

class ConflictResolution {
  constructor({ strategy = 'ps', logger }) {
    if (strategy === 'ps') {
      this.strategy = [
        this.resolveByPriority.bind(this),
        this.resolveBySpecificity.bind(this),
        this.resolveByOrderOfRegistration.bind(this),
      ];
    } else if (strategy === 'sp') {
      this.strategy = [
        this.resolveBySpecificity.bind(this),
        this.resolveByPriority.bind(this),
        this.resolveByOrderOfRegistration.bind(this),
      ];
    } else {
      throw new Error('conflict resolution strategy must be "ps" or "sp"');
    }
    this.logger = logger;
    this.logger.debug({ message: `conflict resolution strategy "${strategy}"` });
  }

  select(actions) {
    if (actions.length === 0) {
      return undefined; // none
    }
    if (actions.length === 1) {
      return actions[0];
    }
    // conflict resolution
    this.logger.debug({ message: `conflict resolution starting with ${actions.length}` });
    let resolved = actions; // start with all actions
    this.strategy.some((resolver) => {
      resolved = resolver(resolved);
      return resolved.length === 1; // break
    });
    return resolved[0];
  }

  resolveByPriority(actions) {
    const prios = actions.map((action) => action.priority);
    const highestPrio = Math.max(...prios);
    const selected = actions.filter((action) => action.priority === highestPrio);
    this.logger.debug({
      message: `conflict resolution by priority ${actions.length} -> ${selected.length}`,
    });
    return selected;
  }

  resolveBySpecificity(actions) {
    const isMoreSpecific = (action, rhs) => action.premises.length > rhs.premises.length
      && intersection(action.premises, rhs.premises).length === rhs.premises.length;
    const isMostSpecific = (action, all) => all.reduce((acc, other) => acc
      && !isMoreSpecific(other, action), true);
    const selected = actions.filter((action) => isMostSpecific(action, actions));
    this.logger.debug({
      message: `conflict resolution by specificity ${actions.length} -> ${selected.length}`,
    });
    return selected;
  }

  resolveByOrderOfRegistration(actions) {
    const selected = [actions[0]];
    this.logger.debug({
      message: `conflict resolution by order of registration ${actions.length} -> 1`,
    });
    return selected;
  }
}

module.exports = ConflictResolution;
