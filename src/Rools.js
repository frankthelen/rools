const RuleSet = require('./RuleSet');
const Logger = require('./Logger');
const Delegator = require('./Delegator');
const WorkingMemory = require('./WorkingMemory');
const ConflictResolution = require('./ConflictResolution');
const observe = require('./observe');
const RuleError = require('./RuleError');

class Rools {
  constructor({ logging } = {}) {
    this.rules = new RuleSet();
    this.maxPasses = 1000; // emergency stop
    this.logger = new Logger(logging);
  }

  async register(rules) {
    rules.forEach((rule) => this.rules.register(rule));
  }

  async evaluate(facts, { strategy } = {}) {
    const startDate = new Date();
    // init
    const memory = new WorkingMemory({
      actions: this.rules.actions,
      premises: this.rules.premises,
    });
    const conflictResolution = new ConflictResolution({ strategy, logger: this.logger });
    const delegator = new Delegator();
    const proxy = observe(facts, (segment) => delegator.delegate(segment));
    // match-resolve-act cycle
    let pass = 0; /* eslint-disable no-await-in-loop */
    for (; pass < this.maxPasses; pass += 1) {
      const next = await this.pass(proxy, delegator, memory, conflictResolution, pass);
      if (!next) break; // for
    } /* eslint-enable no-await-in-loop */
    // return info
    const endDate = new Date();
    return {
      updated: [...memory.updatedSegments],
      fired: pass,
      elapsed: endDate.getTime() - startDate.getTime(),
    };
  }

  async pass(facts, delegator, memory, conflictResolution, pass) {
    this.logger.debug({ message: `evaluate pass ${pass}` });
    // create agenda for premises
    const premisesAgenda = pass === 0 ? memory.premises : memory.getDirtyPremises();
    this.logger.debug({ message: `premises agenda length ${premisesAgenda.length}` });
    // evaluate premises
    premisesAgenda.forEach((premise) => {
      try {
        delegator.set((segment) => { // listen to reading fact segments
          const segmentName = (typeof segment === 'symbol') ? segment.toString() : segment;
          this.logger.debug({ message: `read fact segment "${segmentName}"`, rule: premise.name });
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
    const actionsAgenda = pass === 0 ? memory.actions : premisesAgenda
      .reduce((acc, premise) => [...new Set([...acc, ...premise.actions])], [])
      .filter((action) => {
        const { fired, discarded } = memory.getState(action);
        return !fired && !discarded;
      });
    this.logger.debug({ message: `actions agenda length ${actionsAgenda.length}` });
    // evaluate actions
    actionsAgenda.forEach((action) => {
      memory.getState(action).ready = action.premises.reduce((acc, premise) => acc
        && memory.getState(premise).value, true);
    });
    // create conflict set
    const conflictSet = memory.actions.filter((action) => { // all actions not only actionsAgenda!
      const { fired, ready, discarded } = memory.getState(action);
      return ready && !fired && !discarded;
    });
    this.logger.debug({ message: `conflict set length ${conflictSet.length}` });
    // conflict resolution
    const action = conflictResolution.select(conflictSet);
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
        const segmentName = (typeof segment === 'symbol') ? segment.toString() : segment;
        this.logger.debug({ message: `write fact segment "${segmentName}"`, rule: action.name });
        memory.segmentWrite(segment);
      });
      await action.fire(facts); // >>> fire action!
    } catch (error) { // re-throw error!
      this.logger.error({ message: 'error in action (then)', rule: action.name, error });
      throw new RuleError(`error in action (then): ${action.name}`, error);
    } finally {
      delegator.unset();
    }
    // final rule
    if (action.final) {
      this.logger.debug({ message: 'evaluation stop after final rule', rule: action.name });
      return false; // done
    }
    // activation group
    if (action.activationGroup) {
      this.logger.debug({
        message: `activation group fired "${action.activationGroup}"`,
        rule: action.name,
      });
      this.rules.actionsByActivationGroup[action.activationGroup].forEach((other) => {
        const state = memory.getState(other);
        state.discarded = !state.fired;
      });
    }
    // continue with next pass
    return true;
  }
}

module.exports = Rools;
