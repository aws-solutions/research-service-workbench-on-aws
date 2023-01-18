/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class IdentityPermissionCreationError extends Error {
  public readonly isIdentityPermissionCreationError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isIdentityPermissionCreationError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IdentityPermissionCreationError);
    }
  }
}

export function isIdentityPermissionCreationError(error: unknown): error is IdentityPermissionCreationError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as IdentityPermissionCreationError).isIdentityPermissionCreationError === true
  );
}
