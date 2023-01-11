/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export class RouteMapError extends Error {
  public readonly isRouteMapError: boolean;

  public constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    this.isRouteMapError = true;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RouteMapError);
    }
  }
}

export function isRouteMapError(error: unknown): error is RouteMapError {
  return Boolean(error) && error instanceof Error && (error as RouteMapError).isRouteMapError === true;
}
