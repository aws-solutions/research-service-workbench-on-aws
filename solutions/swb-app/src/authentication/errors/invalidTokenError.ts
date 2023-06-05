/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidTokenError extends Error {
  public readonly isInvalidTokenError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidTokenError);
    }

    this.name = this.constructor.name;
    this.isInvalidTokenError = true;
  }
}

export function isInvalidTokenError(error: unknown): error is InvalidTokenError {
  return Boolean(error) && (error as InvalidTokenError).isInvalidTokenError === true;
}
