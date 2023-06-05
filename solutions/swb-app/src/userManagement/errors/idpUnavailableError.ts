/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class IdpUnavailableError extends Error {
  public readonly isIdpUnavailableError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IdpUnavailableError);
    }

    this.name = this.constructor.name;
    this.isIdpUnavailableError = true;
  }
}

export function isIdpUnavailableError(error: unknown): error is IdpUnavailableError {
  return Boolean(error) && (error as IdpUnavailableError).isIdpUnavailableError === true;
}
