/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class NoInstanceFoundError extends Error {
  public readonly isNoInstanceFoundError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isNoInstanceFoundError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NoInstanceFoundError);
    }
  }
}

export function isNoInstanceFoundError(error: unknown): error is NoInstanceFoundError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as NoInstanceFoundError).isNoInstanceFoundError === true
  );
}
