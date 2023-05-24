/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class StorageNotFoundError extends Error {
  public readonly isEndpointNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isEndpointNotFoundError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, StorageNotFoundError);
    }
  }
}

export function isStorageNotFoundError(error: unknown): error is StorageNotFoundError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as StorageNotFoundError).isEndpointNotFoundError === true
  );
}
