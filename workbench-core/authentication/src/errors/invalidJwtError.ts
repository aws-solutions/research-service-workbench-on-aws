/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidJWTError extends Error {
  public readonly isInvalidJWTError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidJWTError);
    }

    this.name = this.constructor.name;
    this.isInvalidJWTError = true;
  }
}

export function isInvalidJWTError(error: unknown): error is InvalidJWTError {
  return Boolean(error) && (error as InvalidJWTError).isInvalidJWTError === true;
}
