/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class NonUniqueKeyError extends Error {
  public readonly isNonUniqueKeyError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NonUniqueKeyError);
    }

    this.name = this.constructor.name;
    this.isNonUniqueKeyError = true;
  }
}

export function isNonUniqueKeyError(error: unknown): error is NonUniqueKeyError {
  return (
    Boolean(error) && error instanceof Error && (error as NonUniqueKeyError).isNonUniqueKeyError === true
  );
}
