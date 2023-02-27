/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class ProjectDeletedError extends Error {
  public readonly isProjectDeletedError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isProjectDeletedError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ProjectDeletedError);
    }
  }
}

export function isProjectDeletedError(error: unknown): error is ProjectDeletedError {
  return (
    Boolean(error) && error instanceof Error && (error as ProjectDeletedError).isProjectDeletedError === true
  );
}
