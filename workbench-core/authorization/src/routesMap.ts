/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Operation from './operation';

// eslint-disable-next-line @rushstack/typedef-var
export const HTTPMethods = [
  'GET',
  'DELETE',
  'CONNECT',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'TRACE'
] as const;
/**
 * HTTP methods.
 */
export type HTTPMethod = typeof HTTPMethods[number];

/**
 * Maps {@link HTTPMethod} to a set of {@link Operation}s.
 */
export type MethodToOperations = {
  [httpMethod in HTTPMethod]?: Operation[];
};

/**
 * Routes that should be ignored by Authorization.
 */
export interface RoutesIgnored {
  [route: string]: {
    [httpMethod in HTTPMethod]?: boolean;
  };
}
/**
 * Maps a Route to a {@link MethodToOperations}
 *
 * @example
 * ```
 * const routeMap:RouteMap = {
 *  '/sample': {
 *      GET: [
 *        {
 *        action: 'READ',
 *        subject: 'Sample'
 *        }
 *    ]
 *  }
 * }
 * ```
 */
export default interface RoutesMap {
  [route: string]: MethodToOperations;
}
