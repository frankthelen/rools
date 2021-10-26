type Func<T, S> = (...args: T[]) => S;

export default class Delegator<T, S> {
  to: Func<T, S> | null;

  constructor() {
    this.to = null;
  }

  delegate(...args: T[]): S | undefined {
    return this.to ? this.to(...args) : undefined;
  }

  set(to: Func<T, S>): void {
    this.to = to;
  }

  unset(): void {
    this.to = null;
  }
}
