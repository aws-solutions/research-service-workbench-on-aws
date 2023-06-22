/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class ParamNotFoundError extends Error {
  public readonly isParamNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isParamNotFoundError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ParamNotFoundError);
    }
  }
}

export function isParamNotFoundError(error: unknown): error is ParamNotFoundError {
  return (
    Boolean(error) && error instanceof Error && (error as ParamNotFoundError).isParamNotFoundError === true
  );
}
