/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidParameterError extends Error {
  public readonly isInvalidParameterError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidParameterError);
    }

    this.name = this.constructor.name;
    this.isInvalidParameterError = true;
  }
}

export function isInvalidParameterError(error: unknown): error is InvalidParameterError {
  return Boolean(error) && (error as InvalidParameterError).isInvalidParameterError === true;
}
