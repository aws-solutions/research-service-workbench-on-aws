/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { createLogger, format, Logger } from 'winston';
import TransportStream from 'winston-transport';
import { LoggingPlugin } from '../loggingPlugin';
import { LogLevel } from '../logLevel';
import { LogMessage, LogMessageMeta, LogMessageObject } from '../logMessage';
import { ConsoleTransport } from './winstonTransports/consoleTransport';

/**
 * A Logging Plugin that uses Winston to log messages
 */
export class WinstonPlugin implements LoggingPlugin {
  private _logger: Logger;

  /**
   * @param transports - an array of transport instances. Instance classes must extend the TransportStream class.
   * @defaultValue `[new ConsoleTransport()]`
   */
  public constructor(transports: TransportStream[] = [new ConsoleTransport()]) {
    this._logger = createLogger({
      format: format.combine(format.errors({ stack: true }), format.json()),
      transports
    });
  }

  /**
   * Sets the Winston logger maximum log level
   *
   * @param level - the maximum log level
   */
  public setMaxLogLevel(level: LogLevel): void {
    this._logger.level = level;
  }

  /**
   * Sets the Winston default metadata
   *
   * @param metadata - default metadata to include in each log message
   */
  public setDefaultMetadata(metadata: LogMessageObject): void {
    this._logger.defaultMeta = { meta: metadata };
  }

  /**
   * Logs the message using the Winston logger
   *
   * @param level - the log level of the log message
   * @param message - the primary message to be logged
   */
  public log(level: LogLevel, message: LogMessage): void;

  /**
   * Logs the message using the Winston logger
   *
   * @param level - the log level of the log message
   * @param message - the primary message to be logged
   * @param meta - any other data to be logged
   */
  public log(level: LogLevel, message: string, meta: LogMessageMeta): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(level: LogLevel, message: any, meta?: any): void {
    if (meta) {
      this._logger.log(level, message, meta);
    } else {
      if (typeof message === 'object') {
        this._logger.log(level, { message });
      } else {
        this._logger.log(level, message);
      }
    }
  }
}
