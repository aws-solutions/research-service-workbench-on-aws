/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidPaginationTokenError extends Error {
  public readonly isInvalidPaginationTokenError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isInvalidPaginationTokenError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidPaginationTokenError);
    }
  }
}

export function isInvalidPaginationTokenError(error: unknown): error is InvalidPaginationTokenError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as InvalidPaginationTokenError).isInvalidPaginationTokenError === true
  );
}
