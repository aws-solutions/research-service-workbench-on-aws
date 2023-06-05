/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class DataSetExistsError extends Error {
  public readonly isDataSetExistsError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isDataSetExistsError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DataSetExistsError);
    }
  }
}

export function isDataSetExistsError(error: unknown): error is DataSetExistsError {
  return (
    Boolean(error) && error instanceof Error && (error as DataSetExistsError).isDataSetExistsError === true
  );
}
