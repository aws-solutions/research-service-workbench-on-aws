/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class NotAuthorizedError extends Error {
  public readonly isNotAuthorizedError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isNotAuthorizedError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NotAuthorizedError);
    }
  }
}

export function isNotAuthorizedError(error: unknown): error is NotAuthorizedError {
  return (
    Boolean(error) && error instanceof Error && (error as NotAuthorizedError).isNotAuthorizedError === true
  );
}
