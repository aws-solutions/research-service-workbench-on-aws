/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class RoleExistsOnEndpointError extends Error {
  public readonly isRoleExistsOnEndPointError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isRoleExistsOnEndPointError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RoleExistsOnEndpointError);
    }
  }
}

export function isRoleExistsOnEndpointError(error: unknown): error is RoleExistsOnEndpointError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as RoleExistsOnEndpointError).isRoleExistsOnEndPointError === true
  );
}
