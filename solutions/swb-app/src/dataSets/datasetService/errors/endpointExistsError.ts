/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class EndpointExistsError extends Error {
  public readonly isEndpointExistsError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isEndpointExistsError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, EndpointExistsError);
    }
  }
}

export function isEndpointExistsError(error: unknown): error is EndpointExistsError {
  return (
    Boolean(error) && error instanceof Error && (error as EndpointExistsError).isEndpointExistsError === true
  );
}
