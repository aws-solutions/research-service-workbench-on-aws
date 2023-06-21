/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidAccountStateError extends Error {
  public readonly isInvalidAccountStateError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isInvalidAccountStateError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidAccountStateError);
    }
  }
}

export function isInvalidAccountStateError(error: unknown): error is InvalidAccountStateError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as InvalidAccountStateError).isInvalidAccountStateError === true
  );
}
