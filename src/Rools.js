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
    this.getActionId = uniqueid('a');
    this.getPremiseId = uniqueid('p');
    this.logger = new Logger(logging);
  }

  async register(...rules) {
    return Promise.try(() => {
      rules.map(rule => new Rule(rule)).forEach((rule) => {
        const action = new Action({
          ...rule,
          id: this.getActionId(),
        });
        this.actions.push(action);
        rule.when.forEach((when, index) => {
          const hash = md5(when); // is function already introduced by other rule?
          let premise = this.premisesByHash[hash];
          if (!premise) { // create new premise
            premise = new Premise({
              ...rule,
              id: this.getPremiseId(),
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

  async evaluate(facts) {
    // init
    const memory = new WorkingMemory({ actions: this.actions, premises: this.premises });
    const delegator = new Delegator();
    const proxy = observe(facts, segment => delegator.delegate(segment));
    // match-resolve-act cycle
    for (let pass = 0; pass < this.maxPasses; pass += 1) {
      const next = // eslint-disable-next-line no-await-in-loop
        await this.pass(proxy, delegator, memory, pass);
      if (!next) break; // for
    }
    // return facts for convenience only
    return facts;
  }

  async pass(facts, delegator, memory, pass) {
    this.logger.debug({ message: `evaluate pass ${pass}` });
    // create agenda for premises
    const premisesAgenda = pass === 0 ? this.premises : memory.getDirtyPremises();
    // evaluate premises
    premisesAgenda.forEach((premise) => {
      try {
        delegator.set((segment) => { // listen to reading fact segments
          this.logger.debug({ message: `read "${segment}"`, rule: premise.name });
          memory.segmentRead(segment, premise);
        });
        memory.getPremise(premise.id).value = premise.when(facts); // >>> evaluate premise!
      } catch (error) { // ignore error!
        memory.getPremise(premise.id).value = undefined;
        this.logger.error({ message: 'error in premise (when)', rule: premise.name, error });
      } finally {
        delegator.unset();
      }
    });
    // create agenda for actions
    const actionsAgenda = pass === 0 ? this.actions : premisesAgenda
      .reduce((acc, premise) => [...new Set([...acc, ...premise.actions])], [])
      .filter(action => !memory.getAction(action.id).fired);
    // evaluate actions
    actionsAgenda.forEach((action) => {
      memory.getAction(action.id).ready =
        action.premises.reduce((acc, premise) => acc && memory.getPremise(premise.id).value, true);
    });
    // create conflict set
    const conflictSet = this.actions.filter((action) => { // all actions not only actionsAgenda!
      const { fired, ready } = memory.getAction(action.id);
      return ready && !fired;
    });
    // conflict resolution
    const action = this.select(conflictSet);
    if (!action) {
      this.logger.debug({ message: 'evaluation complete' });
      return false; // done
    }
    // fire action
    this.logger.debug({ message: 'fire action', rule: action.name });
    memory.getAction(action.id).fired = true; // mark fired first
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

  select(actions) {
    if (actions.length === 0) {
      return undefined; // none
    }
    if (actions.length === 1) {
      return actions[0]; // the one and only
    }
    // conflict resolution
    const prios = actions.map(action => action.priority);
    const highestPrio = Math.max(...prios);
    const actionsWithPrio = actions.filter(action => action.priority === highestPrio);
    this.logger.debug({ message: 'conflict resolution by priority' });
    return actionsWithPrio[0]; // the first one
  }
}

module.exports = Rools;
