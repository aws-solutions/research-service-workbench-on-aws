import { createLogger, format, Logger } from 'winston';
import TransportStream from 'winston-transport';
import { ConsoleTransport } from './consoleTransport';

export interface LoggerOptions {
  /**
   * Data to be passed along with each log from the logger.
   * Anything that is unable to be JSON.stringified will be ignored
   *
   * @example
   * Here's an example of how to include the service name in each log message:
   * ```
   * {
   *    metadata: {
   *      service: "example-service"
   *    }
   * }
   * ```
   */
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * The minimum log level to log.
   */
  logLevel?: 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';

  /**
   * The list of transports the logger will use.
   */
  transports?: TransportStream[];
}

/**
 * Creates and returns a Winston logging instance that logs to console.
 *
 * @param options - The: {@link LoggerOptions | LoggerOptions} object
 *
 * default values:
 * ```
 * {
 *    logLevel: "info",
 *    transports: [ new ConsoleTransport() ]
 * }
 * ```
 *
 * @returns A logger instance
 */
export function makeLogger(
  options: LoggerOptions = { logLevel: 'info', transports: [new ConsoleTransport()] }
): Logger {
  return createLogger({
    level: options.logLevel || 'info',
    format: format.combine(format.errors({ stack: true }), format.json()),
    transports: options.transports || new ConsoleTransport(),
    defaultMeta: { meta: options.metadata }
  });
}
