import { createLogger, format, Logger } from 'winston';
import TransportStream from 'winston-transport';
import { ConsoleTransport } from './consoleTransport';

export interface LoggerOptions {
  /**
   * Data to be passed along with each log from the logger.
   * Anything that is unable to be JSON.stringified will be ignored
   */
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * The minimum log level to log.
   * If undefined, will fall back to process.env.LOG_LEVEL, or info if neither are defined
   */
  logLevel?: 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';

  /**
   * The list of transports the logger will use.
   * If undefined, the logger will use the ConsoleTransport.
   */
  transports?: TransportStream[];
}

/**
 * Creates and returns a Winston logging instance that logs to console.
 *
 * @param options - the LoggerOptions object
 *
 * @returns A logger instance
 *
 */
export function makeLogger(options?: LoggerOptions): Logger {
  const transports = options?.transports ?? new ConsoleTransport();

  return createLogger({
    level: options?.logLevel ?? process.env.LOG_LEVEL,
    format: format.combine(format.errors({ stack: true }), format.json()),
    transports,
    defaultMeta: { meta: options?.metadata }
  });
}
