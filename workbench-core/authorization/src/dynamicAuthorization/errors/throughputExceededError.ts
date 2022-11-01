/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class ThroughPutExceededError extends Error {
  public readonly isThroughPutExceededError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isThroughPutExceededError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ThroughPutExceededError);
    }
  }
}

export function isThroughPutExceededError(error: unknown): error is ThroughPutExceededError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as ThroughPutExceededError).isThroughPutExceededError === true
  );
}
