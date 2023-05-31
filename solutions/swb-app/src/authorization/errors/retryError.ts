/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class RetryError extends Error {
  public readonly isRetryError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isRetryError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RetryError);
    }
  }
}

export function isRetryError(error: unknown): error is RetryError {
  return Boolean(error) && error instanceof Error && (error as RetryError).isRetryError === true;
}
