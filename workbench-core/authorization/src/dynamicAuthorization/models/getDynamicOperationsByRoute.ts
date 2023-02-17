/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { HTTPMethodParser } from '../../models/routesMap';
import { DynamicOperation } from './dynamicOperation';

// eslint-disable-next-line @rushstack/typedef-var
export const GetDynamicOperationsByRouteRequestParser = z.object({
  /**
   * Route associated to the Dynamic Operations
   */
  route: z.string(),

  /**
   * Method associated to the route
   */
  method: HTTPMethodParser
});

/**
 * Request object for GetDynamicOperationsByRoute
 */
export type GetDynamicOperationsByRouteRequest = z.infer<typeof GetDynamicOperationsByRouteRequestParser>;

/**
 * Response object for GetDynamicOperationsByRoute
 */
export interface GetDynamicOperationsByRouteResponse {
  data: {
    /**
     * {@link DynamicOperation} associated to the route
     */
    dynamicOperations: DynamicOperation[];

    /**
     * Optional path params found
     */
    pathParams?: Record<string, string>;
  };
}
