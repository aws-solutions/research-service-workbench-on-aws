/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class DuplicateKeyError extends Error {
  public readonly isDuplicateKeyError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isDuplicateKeyError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DuplicateKeyError);
    }
  }
}

export function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
  return (
    Boolean(error) && error instanceof Error && (error as DuplicateKeyError).isDuplicateKeyError === true
  );
}
