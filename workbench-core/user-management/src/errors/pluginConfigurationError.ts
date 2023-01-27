/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class PluginConfigurationError extends Error {
  public readonly isPluginConfigurationError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PluginConfigurationError);
    }

    this.name = this.constructor.name;
    this.isPluginConfigurationError = true;
  }
}

export function isPluginConfigurationError(error: unknown): error is PluginConfigurationError {
  return Boolean(error) && (error as PluginConfigurationError).isPluginConfigurationError === true;
}
