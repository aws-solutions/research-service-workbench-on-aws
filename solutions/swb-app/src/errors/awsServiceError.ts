/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class AwsServiceError extends Error {
  public readonly isAwsServiceError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isAwsServiceError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AwsServiceError);
    }
  }
}

export function isAwsServiceError(error: unknown): error is AwsServiceError {
  return Boolean(error) && error instanceof Error && (error as AwsServiceError).isAwsServiceError === true;
}
