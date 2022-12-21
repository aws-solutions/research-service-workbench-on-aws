/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class IdentityPermissionAlreadyExistError extends Error {
  public readonly isIdentityPermissionAlreadyExistError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isIdentityPermissionAlreadyExistError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IdentityPermissionAlreadyExistError);
    }
  }
}

export function isIdentityPermissionAlreadyExistError(
  error: unknown
): error is IdentityPermissionAlreadyExistError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as IdentityPermissionAlreadyExistError).isIdentityPermissionAlreadyExistError === true
  );
}
