import Transport from 'winston-transport';
import { LEVEL, MESSAGE } from 'triple-beam';

/**
 * The info passed from winston to the transport.
 */
interface LoggerInfo {
  [MESSAGE]: string;
  [LEVEL]: string;
}

/**
 * A direct to console transport for use by the Winston logger.
 *
 * This transport assumes that the winston logger has the format.json() formatter as the finalizing formatter.
 */
export class ConsoleTransport extends Transport {
  public log(info: LoggerInfo, callback: () => void): void {
    /* istanbul ignore next */
    setImmediate(() => this.emit('logged', info));

    // Use console here so request ID and log level can be automatically attached in CloudWatch log
    // using info[LEVEL] and info[MESSAGE] is the only way to access those properties, so this rule must be deleted for this section
    /* eslint-disable security/detect-object-injection */
    switch (info[LEVEL]) {
      case 'debug':
        console.debug(info[MESSAGE]);
        break;
      case 'info':
        console.info(info[MESSAGE]);
        break;
      case 'warn':
        console.warn(info[MESSAGE]);
        break;
      case 'error':
        console.error(info[MESSAGE]);
        break;
      default:
        console.log(info[MESSAGE]);
        break;
    }
    /* eslint-enable security/detect-object-injection */

    if (callback) {
      callback();
    }
  }
}
