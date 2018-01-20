const assert = require('assert');
const intersection = require('lodash.intersection');
const md5 = require('md5');
const uniqueid = require('uniqueid');
const Promise = require('bluebird');
const Rule = require('./Rule');
const Action = require('./Action');
const Premise = require('./Premise');
const Logger = require('./Logger');
const Delegator = require('./Delegator');
const WorkingMemory = require('./WorkingMemory');
const observe = require('./observe');

class Rools {
  constructor({ logging } = {}) {
    this.actions = [];
    this.premises = [];
    this.premisesByHash = {};
    this.maxPasses = 1000; // emergency stop
    this.nextActionId = uniqueid('a');
    this.nextPremiseId = uniqueid('p');
    this.logger = new Logger(logging);
    this.strategy = { // conflict solution strategies
      ps: [
        this.resolveByPriority.bind(this),
        this.resolveBySpecificity.bind(this),
        this.resolveByOrderOfRegistration.bind(this),
      ],
      sp: [
        this.resolveBySpecificity.bind(this),
        this.resolveByPriority.bind(this),
        this.resolveByOrderOfRegistration.bind(this),
      ],
    };
  }

  async register(rules) {
    return Promise.try(() => {
      rules.map(rule => new Rule(rule)).forEach((rule) => {
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
      });
    });
  }

  async evaluate(facts, { strategy = 'ps' } = { strategy: 'ps' }) {
    return Promise.try(async () => {
      const startDate = new Date();
      // options
      const strategies = Object.keys(this.strategy);
      assert(strategies.includes(strategy), `strategy must be one of ${strategies}`);
      const conflictResolution = this.strategy[strategy];
      // init
      const memory = new WorkingMemory({ actions: this.actions, premises: this.premises });
      const delegator = new Delegator();
      const proxy = observe(facts, segment => delegator.delegate(segment));
      // match-resolve-act cycle
      this.logger.debug({ message: `evaluate using strategy "${strategy}"` });
      let pass = 0;
      for (; pass < this.maxPasses; pass += 1) {
        const next = // eslint-disable-next-line no-await-in-loop
          await this.pass(proxy, delegator, memory, conflictResolution, pass);
        if (!next) break; // for
      }
      // return info
      const endDate = new Date();
      return {
        updated: [...memory.updatedSegments],
        fired: pass,
        elapsed: endDate.getTime() - startDate.getTime(),
      };
    });
  }

  async pass(facts, delegator, memory, conflictResolution, pass) {
    this.logger.debug({ message: `evaluate pass ${pass}` });
    // create agenda for premises
    const premisesAgenda = pass === 0 ? this.premises : memory.getDirtyPremises();
    this.logger.debug({ message: `premises agenda length ${premisesAgenda.length}` });
    // evaluate premises
    premisesAgenda.forEach((premise) => {
      try {
        delegator.set((segment) => { // listen to reading fact segments
          this.logger.debug({ message: `read "${segment}"`, rule: premise.name });
          memory.segmentRead(segment, premise);
        });
        memory.getState(premise).value = premise.when(facts); // >>> evaluate premise!
      } catch (error) { // ignore error!
        memory.getState(premise).value = undefined;
        this.logger.error({ message: 'error in premise (when)', rule: premise.name, error });
      } finally {
        delegator.unset();
      }
    });
    // create agenda for actions
    const actionsAgenda = pass === 0 ? this.actions : premisesAgenda
      .reduce((acc, premise) => [...new Set([...acc, ...premise.actions])], [])
      .filter(action => !memory.getState(action).fired);
    this.logger.debug({ message: `actions agenda length ${actionsAgenda.length}` });
    // evaluate actions
    actionsAgenda.forEach((action) => {
      memory.getState(action).ready =
        action.premises.reduce((acc, premise) => acc && memory.getState(premise).value, true);
    });
    // create conflict set
    const conflictSet = this.actions.filter((action) => { // all actions not only actionsAgenda!
      const { fired, ready } = memory.getState(action);
      return ready && !fired;
    });
    this.logger.debug({ message: `conflict set length ${conflictSet.length}` });
    // conflict resolution
    const action = this.select(conflictSet, conflictResolution);
    if (!action) {
      this.logger.debug({ message: 'evaluation complete' });
      return false; // done
    }
    // fire action
    this.logger.debug({ message: 'fire action', rule: action.name });
    memory.getState(action).fired = true; // mark fired first
    try {
      memory.clearDirtySegments();
      delegator.set((segment) => { // listen to writing fact segments
        this.logger.debug({ message: `write "${segment}"`, rule: action.name });
        memory.segmentWrite(segment);
      });
      await action.fire(facts); // >>> fire action!
    } catch (error) { // re-throw error!
      this.logger.error({ message: 'error in action (then)', rule: action.name, error });
      throw new Error(`error in action (then): ${action.name}`, error);
    } finally {
      delegator.unset();
    }
    // check final rule
    if (action.final) {
      this.logger.debug({ message: 'evaluation stop after final rule', rule: action.name });
      return false; // done
    }
    // continue with next pass
    return true;
  }

  select(actions, conflictResolution) {
    if (actions.length === 0) {
      return undefined; // none
    }
    if (actions.length === 1) {
      return actions[0];
    }
    // conflict resolution
    this.logger.debug({ message: `conflict resolution starting with ${actions.length}` });
    let resolved = actions; // start with all actions
    conflictResolution.some((resolver) => {
      resolved = resolver(resolved);
      return resolved.length === 1; // break
    });
    return resolved[0];
  }

  resolveByPriority(actions) {
    const prios = actions.map(action => action.priority);
    const highestPrio = Math.max(...prios);
    const selected = actions.filter(action => action.priority === highestPrio);
    this.logger.debug({
      message: `conflict resolution by priority ${actions.length} -> ${selected.length}`,
    });
    return selected;
  }

  resolveBySpecificity(actions) {
    const isMoreSpecific = (action, rhs) =>
      action.premises.length > rhs.premises.length &&
      intersection(action.premises, rhs.premises).length === rhs.premises.length;
    const isMostSpecific = (action, all) =>
      all.reduce((acc, other) => acc && !isMoreSpecific(other, action), true);
    const selected = actions.filter(action => isMostSpecific(action, actions));
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

module.exports = Rools;
