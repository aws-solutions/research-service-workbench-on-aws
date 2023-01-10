/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class TooManyRequestsError extends Error {
  public readonly isTooManyRequestsError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isTooManyRequestsError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, TooManyRequestsError);
    }
  }
}

export function isTooManyRequestsError(error: unknown): error is TooManyRequestsError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as TooManyRequestsError).isTooManyRequestsError === true
  );
}
