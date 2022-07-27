/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class RoleAlreadyExistsError extends Error {
  public readonly isRoleAlreadyExistsError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RoleAlreadyExistsError);
    }

    this.name = this.constructor.name;
    this.isRoleAlreadyExistsError = true;
  }
}

export function isRoleAlreadyExistsError(error: unknown): error is RoleAlreadyExistsError {
  return Boolean(error) && (error as RoleAlreadyExistsError).isRoleAlreadyExistsError === true;
}
