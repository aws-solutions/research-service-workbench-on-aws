/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LogLevel } from './logLevel';
import { LogMessage, LogMessageMeta, LogMessageObject } from './logMessage';

/**
 * The interface class for all Logging Plugins.
 */
export interface LoggingPlugin {
  /**
   * Logs the message.
   *
   * @param level - the log level of the log message
   * @param message - the primary message to be logged
   */
  log(level: LogLevel, message: LogMessage): void;

  /**
   * Logs the message.
   *
   * @param level - the log level of the log message
   * @param message - the primary message to be logged
   * @param meta - additional data to be logged
   */
  log(level: LogLevel, message: string, meta: LogMessageMeta): void;

  /**
   * Sets the maximum {@link LogLevel} for the plugin.
   *
   * @param level - the maximum log level
   */
  setMaxLogLevel(level: LogLevel): void;

  /**
   * Sets the default metadata for the plugin.
   *
   * @param metadata - default metadata to include in each log message
   */
  setDefaultMetadata(metadata: LogMessageObject): void;
}
