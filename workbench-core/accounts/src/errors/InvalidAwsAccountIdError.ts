/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidAwsAccountIdError extends Error {
  public readonly isInvalidAwsAccountIdError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isInvalidAwsAccountIdError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidAwsAccountIdError);
    }
  }
}

export function isInvalidAwsAccountIdError(error: unknown): error is InvalidAwsAccountIdError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as InvalidAwsAccountIdError).isInvalidAwsAccountIdError === true
  );
}
