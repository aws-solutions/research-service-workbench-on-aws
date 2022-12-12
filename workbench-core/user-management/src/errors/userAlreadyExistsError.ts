/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class UserAlreadyExistsError extends Error {
  public readonly isUserAlreadyExistsError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserAlreadyExistsError);
    }

    this.name = this.constructor.name;
    this.isUserAlreadyExistsError = true;
  }
}

export function isUserAlreadyExistsError(error: unknown): error is UserAlreadyExistsError {
  return Boolean(error) && (error as UserAlreadyExistsError).isUserAlreadyExistsError === true;
}
