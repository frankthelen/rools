import Premise from './Premise';

import { Action as ActionFunc, Facts } from './index.d';

interface ActionOptions {
  id: string;
  name: string;
  then: ActionFunc;
  priority?: number;
  final?: boolean;
  activationGroup?: string;
}

export default class Action {
  id: string;
  name: string;
  then: ActionFunc;
  priority: number;
  final: boolean;
  activationGroup?: string;
  premises: Premise[];

  constructor({
    id, name, then, priority = 0, final = false, activationGroup,
  }: ActionOptions) {
    this.id = id;
    this.name = name; // for logging only
    this.then = then;
    this.priority = priority;
    this.final = final;
    this.activationGroup = activationGroup;
    this.premises = [];
  }

  add(premise: Premise): void {
    this.premises.push(premise);
  }

  async fire(facts: Facts): Promise<void> {
    const thenable = this.then(facts); // >>> fire action!
    return thenable && thenable.then ? thenable : undefined;
  }
}
