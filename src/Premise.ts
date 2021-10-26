import Action from './Action';

import { Premise as PremiseFunc } from './index.d';

interface PremiseOptions {
  id: string;
  name: string;
  when: PremiseFunc;
}

export default class Premise {
  id: string;
  name: string;
  when: PremiseFunc;
  actions: Action[];

  constructor({
    id, name, when,
  }: PremiseOptions) {
    this.id = id;
    this.name = name; // for logging only
    this.when = when;
    this.actions = [];
  }

  add(action: Action): void {
    this.actions.push(action);
  }
}
