import Rule from './Rule';
import RuleSet from './RuleSet';
import Logger from './Logger';
import Delegator from './Delegator';
import WorkingMemory from './WorkingMemory';
import ConflictResolution from './ConflictResolution';
import observe from './observe';
import RuleError from './RuleError';

import {
  Facts, RoolsOptions, EvaluateOptions, EvaluateResult, SegmentType,
} from './index.d';
import Action from './Action';

type DelegatorType = Delegator<SegmentType, void>;

export default class Rools {
  rules: RuleSet;
  maxPasses: number;
  logger: Logger;

  constructor({ logging }: RoolsOptions = {}) {
    this.rules = new RuleSet();
    this.maxPasses = 1000; // emergency stop
    this.logger = new Logger(logging);
  }

  async register(rules: Rule[]): Promise<void> {
    rules.forEach((rule) => this.rules.register(rule));
  }

  async evaluate(facts: Facts, { strategy }: EvaluateOptions = {}): Promise<EvaluateResult> {
    const startDate = new Date();
    // init
    const memory = new WorkingMemory({
      actions: this.rules.actions,
      premises: this.rules.premises,
    });
    const conflictResolution = new ConflictResolution({ strategy, logger: this.logger });
    const delegator: DelegatorType = new Delegator();
    const proxy = observe(facts as object, (segment: SegmentType) => delegator.delegate(segment));
    // match-resolve-act cycle
    let pass = 0;
    for (; pass < this.maxPasses; pass += 1) { // eslint-disable-next-line no-await-in-loop
      const next = await this.pass(proxy, delegator, memory, conflictResolution, pass);
      if (!next) break; // for
    }
    // return info
    const endDate = new Date();
    return {
      updated: [...memory.accessedByActions], // for backward compatibility
      accessedByActions: [...memory.accessedByActions],
      accessedByPremises: [...memory.accessedByPremises],
      fired: pass,
      elapsed: endDate.getTime() - startDate.getTime(),
    };
  }

  async pass(
    facts: Facts, delegator: DelegatorType, memory: WorkingMemory,
    conflictResolution: ConflictResolution, pass: number,
  ): Promise<boolean> {
    this.logger.debug({ message: `evaluate pass ${pass}` });
    // create agenda for premises
    const premisesAgenda = pass === 0 ? memory.premises : memory.getDirtyPremises();
    this.logger.debug({ message: `premises agenda length ${premisesAgenda.length}` });
    // evaluate premises
    premisesAgenda.forEach((premise) => {
      try {
        delegator.set((segment: SegmentType) => { // listen to reading fact segments
          const segmentName = (typeof segment === 'symbol') ? segment.toString() : segment;
          this.logger.debug({ message: `access fact segment "${segmentName}" in premise`, rule: premise.name });
          memory.segmentInPremise(segment, premise);
        });
        memory.getPremiseState(premise).value = premise.when(facts); // >>> evaluate premise!
      } catch (error) { // ignore error!
        memory.getPremiseState(premise).value = undefined;
        this.logger.error({ message: 'error in premise (when)', rule: premise.name, error: error as Error });
      } finally {
        delegator.unset();
      }
    });
    // create agenda for actions
    const actionsAgenda = pass === 0 ? memory.actions : premisesAgenda
      .reduce((acc, premise) => [...new Set([...acc, ...premise.actions])], [] as Action[])
      .filter((action) => {
        const { fired, discarded } = memory.getActionState(action);
        return !fired && !discarded;
      });
    this.logger.debug({ message: `actions agenda length ${actionsAgenda.length}` });
    // evaluate actions
    actionsAgenda.forEach((action) => {
      memory.getActionState(action).ready = action.premises
        .reduce<boolean>((acc, premise) => acc && !!memory.getPremiseState(premise).value, true);
    });
    // create conflict set
    const conflictSet = memory.actions.filter((action) => { // all actions not only actionsAgenda!
      const { fired, ready, discarded } = memory.getActionState(action);
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
    memory.getActionState(action).fired = true; // mark fired first
    try {
      memory.clearDirtySegments();
      delegator.set((segment) => { // listen to writing fact segments
        const segmentName = (typeof segment === 'symbol') ? segment.toString() : segment;
        this.logger.debug({ message: `access fact segment "${segmentName}" in action`, rule: action.name });
        memory.segmentInAction(segment);
      });
      await action.fire(facts); // >>> fire action!
    } catch (error) { // re-throw error!
      this.logger.error({ message: 'error in action (then)', rule: action.name, error: error as Error });
      throw new RuleError(`error in action (then): ${action.name}`, error as Error);
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
        const state = memory.getActionState(other);
        state.discarded = !state.fired;
      });
    }
    // continue with next pass
    return true;
  }
}
