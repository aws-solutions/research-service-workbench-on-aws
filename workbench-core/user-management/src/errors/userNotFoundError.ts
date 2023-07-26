/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class UserNotFoundError extends Error {
  public readonly isUserNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserNotFoundError);
    }

    this.name = this.constructor.name;
    this.isUserNotFoundError = true;
  }
}

export function isUserNotFoundError(error: unknown): error is UserNotFoundError {
  return Boolean(error) && (error as UserNotFoundError).isUserNotFoundError === true;
}
