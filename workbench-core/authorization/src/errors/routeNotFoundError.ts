/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class RouteNotFoundError extends Error {
  public readonly isRouteNotFoundError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isRouteNotFoundError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RouteNotFoundError);
    }
  }
}

export function isRouteNotFoundError(error: unknown): error is RouteNotFoundError {
  return (
    Boolean(error) && error instanceof Error && (error as RouteNotFoundError).isRouteNotFoundError === true
  );
}
