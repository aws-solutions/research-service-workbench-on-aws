import { createLogger, format, Logger } from 'winston';
import { ConsoleTransport } from './consoleTransport';

/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface LoggerOptions {
  metadata?: any;
  logLevel?: 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';
}

/**
 * Creates and returns a Winston logging instance that logs to console.
 *
 * @param options - the LoggerOptions object
 * @returns A logger instance
 *
 */
export function makeLogger(options?: LoggerOptions): Logger {
  return createLogger({
    level: options?.logLevel ?? process.env.LOG_LEVEL,
    format: format.combine(format.errors({ stack: true }), format.json()),
    transports: [new ConsoleTransport()],
    defaultMeta: { meta: options?.metadata }
  });
}
