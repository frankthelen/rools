class Logger {
  constructor({
    error = true, debug = false, delegate = null,
  } = { error: true, debug: false, delegate: null }) {
    this.filter = { error, debug };
    this.delegate = delegate;
  }

  debug(options) {
    if (!this.filter.debug) return;
    this.log({ ...options, level: 'debug' });
  }

  error(options) {
    if (!this.filter.error) return;
    this.log({ ...options, level: 'error' });
  }

  log(options) {
    const out = this.delegate ? this.delegate : Logger.logDefault;
    out(options);
  }

  static logDefault({ message, rule, error }) {
    const msg = rule ? `# ${message} - "${rule}"` : `# ${message}`;
    if (error) {
      console.error(msg, error); // eslint-disable-line no-console
    } else {
      console.log(msg); // eslint-disable-line no-console
    }
  }
}

module.exports = Logger;
