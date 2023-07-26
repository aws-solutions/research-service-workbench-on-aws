/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class RoleNotFoundError extends Error {
  public readonly isRoleNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RoleNotFoundError);
    }

    this.name = this.constructor.name;
    this.isRoleNotFoundError = true;
  }
}

export function isRoleNotFoundError(error: unknown): error is RoleNotFoundError {
  return Boolean(error) && (error as RoleNotFoundError).isRoleNotFoundError === true;
}
