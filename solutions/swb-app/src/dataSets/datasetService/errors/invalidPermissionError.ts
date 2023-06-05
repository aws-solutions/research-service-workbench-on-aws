/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidPermissionError extends Error {
  public readonly isInvalidPermissionError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isInvalidPermissionError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidPermissionError);
    }
  }
}

export function isInvalidPermissionError(error: unknown): error is InvalidPermissionError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as InvalidPermissionError).isInvalidPermissionError === true
  );
}
