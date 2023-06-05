/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidIamRoleError extends Error {
  public readonly isInvalidIamRoleError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isInvalidIamRoleError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidIamRoleError);
    }
  }
}

export function isInvalidIamRoleError(error: unknown): error is InvalidIamRoleError {
  return (
    Boolean(error) && error instanceof Error && (error as InvalidIamRoleError).isInvalidIamRoleError === true
  );
}
