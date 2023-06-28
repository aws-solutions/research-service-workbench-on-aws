/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class ConnectionInfoNotDefinedError extends Error {
  public readonly isConnectionInfoNotDefinedError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isConnectionInfoNotDefinedError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ConnectionInfoNotDefinedError);
    }
  }
}

export function isConnectionInfoNotDefinedError(error: unknown): error is ConnectionInfoNotDefinedError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as ConnectionInfoNotDefinedError).isConnectionInfoNotDefinedError === true
  );
}
