/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class AuditIncompleteError extends Error {
  public readonly isAuditIncompleteError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isAuditIncompleteError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AuditIncompleteError);
    }
  }
}

export function isAuditIncompleteError(error: unknown): error is AuditIncompleteError {
  return (
    Boolean(error) &&
    error instanceof Error &&
    (error as AuditIncompleteError).isAuditIncompleteError === true
  );
}
