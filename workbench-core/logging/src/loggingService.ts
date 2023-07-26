/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingPlugin } from './loggingPlugin';
import { LogLevel } from './logLevel';
import { LogMessage, LogMessageMeta, LogMessageObject } from './logMessage';
import { WinstonPlugin } from './plugins/winstonPlugin';

/**
 * A LoggingServiceConfig interface that contains the configuration for the LoggingService.
 */
export interface LoggingServiceConfig {
  /**
   * Object to be included with each log from the logger.
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
  defaultMetadata?: LogMessageObject;

  /**
   * The maximum log level to log.
   */
  maxLogLevel?: LogLevel;

  /**
   * The plugin used to send the logs. Must implement the {@link LoggingPlugin} interface
   */
  loggingPlugin?: LoggingPlugin;

  /**
   * If true, will include the function name, file name, and line number of the calling function.
   * format: \<function name\> (\<file name\>:\<line number\>)
   *
   * Note: Only compatible with the V8 JavaScript engine (Node.js, Chromium-based web browsers, etc.)
   */
  includeLocation?: boolean;
}

/**
 * A LoggingService instance.
 */
export class LoggingService {
  private _loggingPlugin: LoggingPlugin;
  private _includeLocation: boolean;

  /**
   *
   * @param config - The {@link LoggingServiceConfig} object
   *
   *  * default values:
   * ```
   * {
   *    logLevel: "info", // Will log error, warn, and info log levels
   *    transports: [ new ConsoleTransport() ],
   *    includeLocation: true
   * }
   * ```
   */
  public constructor(
    config: LoggingServiceConfig = {
      maxLogLevel: 'info',
      loggingPlugin: new WinstonPlugin(),
      includeLocation: true
    }
  ) {
    this._includeLocation = config.includeLocation ?? true;
    this._loggingPlugin = config.loggingPlugin ?? new WinstonPlugin();

    this._loggingPlugin.setMaxLogLevel(config.maxLogLevel ?? 'info');

    if (config.defaultMetadata) {
      this._loggingPlugin.setDefaultMetadata(config.defaultMetadata);
    }
  }

  /**
   * Logs using the "error" log level
   *
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  public error(message: string, meta: LogMessageMeta): void;

  /**
   * Logs using the "error" log level
   *
   * @param message - The message to be logged
   */
  public error(message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: any, meta?: any): void {
    this._log('error', message, meta);
  }

  /**
   * Logs using the "warn" log level
   *
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  public warn(message: string, meta: LogMessageMeta): void;

  /**
   * Logs using the "warn" log level
   *
   * @param message - The message to be logged
   */
  public warn(message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: any, meta?: any): void {
    this._log('warn', message, meta);
  }

  /**
   * Logs using the "info" log level
   *
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  public info(message: string, meta: LogMessageMeta): void;

  /**
   * Logs using the "info" log level
   *
   * @param message - The message to be logged
   */
  public info(message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: any, meta?: any): void {
    this._log('info', message, meta);
  }

  /**
   * Logs using the "http" log level
   *
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  public http(message: string, meta: LogMessageMeta): void;

  /**
   * Logs using the "http" log level
   *
   * @param message - The message to be logged
   */
  public http(message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public http(message: any, meta?: any): void {
    this._log('http', message, meta);
  }

  /**
   * Logs using the "verbose" log level
   *
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  public verbose(message: string, meta: LogMessageMeta): void;

  /**
   * Logs using the "verbose" log level
   *
   * @param message - The message to be logged
   */
  public verbose(message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public verbose(message: any, meta?: any): void {
    this._log('verbose', message, meta);
  }

  /**
   * Logs using the "debug" log level
   *
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  public debug(message: string, meta: LogMessageMeta): void;

  /**
   * Logs using the "debug" log level
   *
   * @param message - The message to be logged
   */
  public debug(message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: any, meta?: any): void {
    this._log('debug', message, meta);
  }

  /**
   * Logs using the "silly" log level
   *
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  public silly(message: string, meta: LogMessageMeta): void;

  /**
   * Logs using the "silly" log level
   *
   * @param message - The message to be logged
   */
  public silly(message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public silly(message: any, meta?: any): void {
    this._log('silly', message, meta);
  }

  /**
   * Takes a log message, optionally appends the calling function location and metadata, and sends to the Winston logger
   *
   * @param level - The {@link LogLevel} to log at
   * @param message - The message to be logged
   * @param meta - Any additional data to be included in the log
   */
  private _log(level: LogLevel, message: string, meta: LogMessageMeta): void;

  /**
   * Takes a log message, optionally appends the calling function location and metadata, and sends to the Winston logger
   *
   * @param level - The {@link LogLevel} to log at
   * @param message - The message to be logged
   */
  private _log(level: LogLevel, message: LogMessage): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _log(level: LogLevel, message: any, meta?: any): void {
    if (meta) {
      if (this._includeLocation) {
        meta.location = this._getCallingFunctionLocation();
      }

      this._loggingPlugin.log(level, message, meta);
    } else {
      if (this._includeLocation) {
        this._loggingPlugin.log(level, message, { location: this._getCallingFunctionLocation() });
      } else {
        this._loggingPlugin.log(level, message);
      }
    }
  }

  /**
   * Creates a string representation of the log method's calling function
   *
   * @returns a string in the format: \<function name\> (\<file name\>:\<line number\>)
   */
  private _getCallingFunctionLocation(): string {
    const temp = new Error();
    const lines = temp.stack?.split(' at ')[4].trim();

    return `${lines}`;
  }
}
