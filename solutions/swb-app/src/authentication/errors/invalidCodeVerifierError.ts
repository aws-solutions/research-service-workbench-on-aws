/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidCodeVerifierError extends Error {
  public readonly isInvalidCodeVerifierError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidCodeVerifierError);
    }

    this.name = this.constructor.name;
    this.isInvalidCodeVerifierError = true;
  }
}

export function isInvalidCodeVerifierError(error: unknown): error is InvalidCodeVerifierError {
  return Boolean(error) && (error as InvalidCodeVerifierError).isInvalidCodeVerifierError === true;
}
