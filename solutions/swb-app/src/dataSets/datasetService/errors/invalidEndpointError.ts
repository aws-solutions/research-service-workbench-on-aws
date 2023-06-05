/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class InvalidEndpointError extends Error {
  public readonly isInvalidEndpointError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isInvalidEndpointError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidEndpointError);
    }
  }
}

export function isInvalidEndpointError(error: unknown): error is InvalidEndpointError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as InvalidEndpointError).isInvalidEndpointError === true
  );
}
