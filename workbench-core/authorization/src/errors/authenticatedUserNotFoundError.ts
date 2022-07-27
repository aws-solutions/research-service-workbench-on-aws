/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class AuthenticatedUserNotFoundError extends Error {
  public readonly isAuthenticatedUserNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isAuthenticatedUserNotFoundError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AuthenticatedUserNotFoundError);
    }
  }
}

export function isAuthenticatedUserNotFoundError(error: unknown): error is AuthenticatedUserNotFoundError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as AuthenticatedUserNotFoundError).isAuthenticatedUserNotFoundError === true
  );
}
