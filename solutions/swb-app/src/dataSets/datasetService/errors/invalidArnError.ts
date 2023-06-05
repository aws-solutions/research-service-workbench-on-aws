/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidArnError extends Error {
  public readonly isInvalidArnError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isInvalidArnError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidArnError);
    }
  }
}

export function isInvalidArnError(error: unknown): error is InvalidArnError {
  return Boolean(error) && error instanceof Error && (error as InvalidArnError).isInvalidArnError === true;
}
