/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class NoKeyExistsError extends Error {
  public readonly isNoKeyExistsError: boolean;

  public constructor(message?: string) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NoKeyExistsError);
    }

    this.name = this.constructor.name;
    this.isNoKeyExistsError = true;
  }
}

export function isNoKeyExistsError(error: unknown): error is NoKeyExistsError {
  return Boolean(error) && error instanceof Error && (error as NoKeyExistsError).isNoKeyExistsError === true;
}
