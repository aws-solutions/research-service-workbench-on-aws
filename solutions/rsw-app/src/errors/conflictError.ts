/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class ConflictError extends Error {
  public readonly isConflictError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConflictError);
    }

    this.name = this.constructor.name;
    this.isConflictError = true;
  }
}

export function isConflictError(error: unknown): error is ConflictError {
  return Boolean(error) && (error as ConflictError).isConflictError === true;
}
