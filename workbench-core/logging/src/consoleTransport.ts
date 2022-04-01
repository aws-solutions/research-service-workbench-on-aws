import Transport from 'winston-transport';

/**
 * A direct to console transport for use by the Winston logger.
 */
export class ConsoleTransport extends Transport {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  public log(info: any, callback: () => void): void {
    /* istanbul ignore next */
    setImmediate(() => this.emit('logged', info));

    // Use console here so request ID and log level can be automatically attached in CloudWatch log
    switch (info[Symbol.for('level')]) {
      case 'debug':
        console.debug(info[Symbol.for('message')]);
        break;
      case 'info':
        console.info(info[Symbol.for('message')]);
        break;
      case 'warn':
        console.warn(info[Symbol.for('message')]);
        break;
      case 'error':
        console.error(info[Symbol.for('message')]);
        break;
      default:
        console.log(info[Symbol.for('message')]);
        break;
    }

    if (callback) {
      callback();
    }
  }
}
