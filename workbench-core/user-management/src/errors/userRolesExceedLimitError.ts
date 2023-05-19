/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class UserRolesExceedLimitError extends Error {
  public readonly isUserRolesExceedLimitError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserRolesExceedLimitError);
    }

    this.name = this.constructor.name;
    this.isUserRolesExceedLimitError = true;
  }
}

export function isUserRolesExceedLimitError(error: unknown): error is UserRolesExceedLimitError {
  return Boolean(error) && (error as UserRolesExceedLimitError).isUserRolesExceedLimitError === true;
}
