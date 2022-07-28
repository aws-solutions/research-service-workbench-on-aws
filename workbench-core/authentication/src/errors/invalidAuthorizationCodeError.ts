/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidAuthorizationCodeError extends Error {
  public readonly isInvalidAuthorizationCodeError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidAuthorizationCodeError);
    }

    this.name = this.constructor.name;
    this.isInvalidAuthorizationCodeError = true;
  }
}

export function isInvalidAuthorizationCodeError(error: unknown): error is InvalidAuthorizationCodeError {
  return Boolean(error) && (error as InvalidAuthorizationCodeError).isInvalidAuthorizationCodeError === true;
}
