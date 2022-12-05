/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class DataSetHasEndpointError extends Error {
  public readonly isDataSetHasEndpointError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isDataSetHasEndpointError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DataSetHasEndpointError);
    }
  }
}

export function isDataSetHasEndpointError(error: unknown): error is DataSetHasEndpointError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as DataSetHasEndpointError).isDataSetHasEndpointError === true
  );
}
