export interface LogItem {
  message: string;
  rule?: string;
  error?: Error;
}

export interface LogItemWithLevel extends LogItem {
  level: 'debug' | 'error';
}

export interface LoggerOptions {
  error?: boolean;
  debug?: boolean;
  delegate?: (item: LogItemWithLevel) => void;
}

export default class Logger {
  filter: { error: boolean, debug: boolean };
  delegate?: (item: LogItemWithLevel) => void;

  constructor({
    error = true, debug = false, delegate,
  }: LoggerOptions = { error: true, debug: false }) {
    this.filter = { error, debug };
    this.delegate = delegate;
  }

  debug(item: LogItem): void {
    if (!this.filter.debug) return;
    this.log({ ...item, level: 'debug' });
  }

  error(item: LogItem): void {
    if (!this.filter.error) return;
    this.log({ ...item, level: 'error' });
  }

  log(item: LogItemWithLevel): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const out = this.delegate ? this.delegate : Logger.logDefault;
    out(item);
  }

  static logDefault({ message, rule, error }: LogItemWithLevel): void {
    const msg = rule ? `# ${message} - "${rule}"` : `# ${message}`;
    if (error) {
      console.error(msg, error); // eslint-disable-line no-console
    } else {
      console.log(msg); // eslint-disable-line no-console
    }
  }
}
