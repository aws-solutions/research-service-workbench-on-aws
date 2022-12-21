/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { HTTPMethod } from '../../routesMap';
import { DynamicOperation } from './dynamicOperation';
/**
 * Request object for GetDynamicOperationsByRoute
 */
export interface GetDynamicOperationsByRouteRequest {
  /**
   * Route associated to the Dynamic Operations
   */
  route: string;
  /**
   * Method associated to the route
   */
  method: HTTPMethod;
}

/**
 * Response object for GetDynamicOperationsByRoute
 */
export interface GetDynamicOperationsByRouteResponse {
  /**
   * {@link DynamicOperation} associated to the route
   */
  dynamicOperations: DynamicOperation[];
}
