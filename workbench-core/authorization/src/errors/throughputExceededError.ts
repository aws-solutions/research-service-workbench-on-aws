/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class ThroughputExceededError extends Error {
  public readonly isThroughputExceededError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isThroughputExceededError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ThroughputExceededError);
    }
  }
}

export function isThroughputExceededError(error: unknown): error is ThroughputExceededError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as ThroughputExceededError).isThroughputExceededError === true
  );
}
