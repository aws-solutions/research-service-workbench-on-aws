/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class DatabaseError extends Error {
  public readonly isDatabaseError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }

    this.name = this.constructor.name;
    this.isDatabaseError = true;
  }
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return Boolean(error) && (error as DatabaseError).isDatabaseError === true;
}
