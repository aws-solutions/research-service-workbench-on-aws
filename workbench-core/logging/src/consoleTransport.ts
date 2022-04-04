import { LEVEL, MESSAGE } from 'triple-beam';
import TransportStream from 'winston-transport';

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
 * This transport assumes that the winston logger is formatted by one of Winston's "finalizing formats":
    - json
    - logstash
    - printf
    - prettyPrint
    - simple
 */
export class ConsoleTransport extends TransportStream {
  public log(info: LoggerInfo, callback: () => void): void {
    /* istanbul ignore next */
    setImmediate(() => this.emit('logged', info));

    // Use console here so request ID and log level can be automatically attached in CloudWatch log
    /* eslint-disable security/detect-object-injection */
    // info[LEVEL] and info[MESSAGE] break the above eslint rule but are where Winston stores the level and message properties, so the rule must be turned off for this section
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
