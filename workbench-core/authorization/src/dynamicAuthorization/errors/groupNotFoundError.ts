/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class GroupNotFoundError extends Error {
  public readonly isGroupNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isGroupNotFoundError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, GroupNotFoundError);
    }
  }
}

export function isGroupNotFoundError(error: unknown): error is GroupNotFoundError {
  return (
    Boolean(error) && error instanceof Error && (error as GroupNotFoundError).isGroupNotFoundError === true
  );
}
