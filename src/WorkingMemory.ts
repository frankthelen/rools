import Action from './Action';
import Premise from './Premise';

import { SegmentType } from './index.d';

interface ActionState {
  ready: boolean;
  fired: boolean;
  discarded: boolean;
}

interface PremiseState {
  value: boolean | undefined;
}

interface WorkingMemoryOptions {
  actions: Action[];
  premises: Premise[];
}

export default class WorkingMemory {
  actions: Action[];
  premises: Premise[];
  actionsById: Record<string, ActionState>;
  premisesById: Record<string, PremiseState>;
  dirtySegments: Set<SegmentType>;
  premisesBySegment: Record<SegmentType, Set<Premise>>;
  accessedByActions: Set<SegmentType>;
  accessedByPremises: Set<SegmentType>;

  constructor({ actions, premises }: WorkingMemoryOptions) {
    this.actions = actions;
    this.premises = premises;
    this.actionsById = {}; // hash
    this.premisesById = {}; // hash
    this.actions.forEach((action) => {
      this.actionsById[action.id] = { ready: false, fired: false, discarded: false };
    });
    this.premises.forEach((premise) => {
      this.premisesById[premise.id] = { value: undefined };
    });
    this.dirtySegments = new Set();
    this.premisesBySegment = {}; // hash
    this.accessedByActions = new Set(); // total
    this.accessedByPremises = new Set(); // total
  }

  getActionState(action: Action): ActionState {
    const { id } = action;
    return this.actionsById[id];
  }

  getPremiseState(premise: Premise): PremiseState {
    const { id } = premise;
    return this.premisesById[id];
  }

  clearDirtySegments(): void {
    this.dirtySegments.clear();
  }

  getDirtyPremises(): Premise[] {
    const premises = new Set<Premise>();
    this.dirtySegments.forEach((segment) => {
      const dirtyPremises = this.premisesBySegment[segment] || [];
      dirtyPremises.forEach((premise) => {
        premises.add(premise);
      });
    });
    return [...premises];
  }

  segmentInAction(segment: SegmentType): void {
    this.dirtySegments.add(segment);
    this.accessedByActions.add(segment);
  }

  segmentInPremise(segment: SegmentType, premise: Premise): void {
    this.accessedByPremises.add(segment);
    let premises = this.premisesBySegment[segment];
    if (!premises) {
      premises = new Set<Premise>();
      this.premisesBySegment[segment] = premises;
    }
    premises.add(premise); // might grow over time with "hidden" conditions
  }
}
