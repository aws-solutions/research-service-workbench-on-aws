/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { HTTPMethodParser } from '../../models/routesMap';

// eslint-disable-next-line @rushstack/typedef-var
export const IsRouteProtectedRequestParser = z.object({
  /**
   * Route being checked
   */
  route: z.string(),

  /**
   * {@link HTTPMethod}
   */
  method: HTTPMethodParser
});

/**
 * Request object for IsRouteProtected
 */
export type IsRouteProtectedRequest = z.infer<typeof IsRouteProtectedRequestParser>;

/**
 * Response object for IsRouteProtected
 */
export interface IsRouteProtectedResponse {
  data: {
    /**
     * Describes if route is protected
     */
    routeProtected: boolean;
  };
}
