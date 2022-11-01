/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class BadConfigurationError extends Error {
  public readonly isBadConfigurationError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isBadConfigurationError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, BadConfigurationError);
    }
  }
}

export function isBadConfigurationError(error: unknown): error is BadConfigurationError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as BadConfigurationError).isBadConfigurationError === true
  );
}
