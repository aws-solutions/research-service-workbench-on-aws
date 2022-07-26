/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class PermissionNotGrantedError extends Error {
  public readonly isPermissionNotGrantedError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isPermissionNotGrantedError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PermissionNotGrantedError);
    }
  }
}

export function isPermissionNotGrantedError(error: unknown): error is PermissionNotGrantedError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as PermissionNotGrantedError).isPermissionNotGrantedError === true
  );
}
