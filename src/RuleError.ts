export default class RuleError extends Error {
  cause: Error;

  constructor(message: string, error: Error) {
    super(message);
    this.cause = error;
  }
}
