/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DynamicOperation } from '../dynamicAuthorization/models/dynamicOperation';
import Operation from './operation';

// eslint-disable-next-line @rushstack/typedef-var
export const HTTPMethodParser = z.union([
  z.literal('GET'),
  z.literal('DELETE'),
  z.literal('CONNECT'),
  z.literal('HEAD'),
  z.literal('OPTIONS'),
  z.literal('PATCH'),
  z.literal('POST'),
  z.literal('PUT'),
  z.literal('TRACE')
]);

/**
 * HTTP methods.
 */
export type HTTPMethod = z.infer<typeof HTTPMethodParser>;

/**
 * Maps {@link HTTPMethod} to a set of {@link Operation}s.
 */
export type MethodToOperations = {
  [httpMethod in HTTPMethod]?: Operation[];
};

export type MethodToDynamicOperations = {
  [httpMethod in HTTPMethod]?: DynamicOperation[];
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

export interface DynamicRoutesMap {
  [route: string]: MethodToDynamicOperations;
}
