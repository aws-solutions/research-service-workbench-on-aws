/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class DataSetNotFoundError extends Error {
  public readonly isDataSetNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isDataSetNotFoundError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DataSetNotFoundError);
    }
  }
}

export function isDataSetNotFoundError(error: unknown): error is DataSetNotFoundError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as DataSetNotFoundError).isDataSetNotFoundError === true
  );
}
