/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class TokenRevocationServiceNotProvidedError extends Error {
  public readonly isTokenRevocationServiceNotProvidedError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokenRevocationServiceNotProvidedError);
    }

    this.name = this.constructor.name;
    this.isTokenRevocationServiceNotProvidedError = true;
  }
}

export function isTokenRevocationServiceNotProvidedError(
  error: unknown
): error is TokenRevocationServiceNotProvidedError {
  return (
    Boolean(error) &&
    (error as TokenRevocationServiceNotProvidedError).isTokenRevocationServiceNotProvidedError === true
  );
}
