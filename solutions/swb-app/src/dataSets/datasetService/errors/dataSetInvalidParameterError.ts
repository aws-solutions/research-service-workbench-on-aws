/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class DataSetInvalidParameterError extends Error {
  public readonly isDataSetInvalidParameterError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isDataSetInvalidParameterError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DataSetInvalidParameterError);
    }
  }
}

export function isDataSetInvalidParameterError(error: unknown): error is DataSetInvalidParameterError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as DataSetInvalidParameterError).isDataSetInvalidParameterError === true
  );
}
