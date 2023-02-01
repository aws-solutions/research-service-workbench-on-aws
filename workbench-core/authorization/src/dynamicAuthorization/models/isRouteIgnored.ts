/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { HTTPMethodParser } from '../../models/routesMap';

// eslint-disable-next-line @rushstack/typedef-var
export const IsRouteIgnoredRequestParser = z.object({
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
 * Request object for IsRouteIgnored
 */
export type IsRouteIgnoredRequest = z.infer<typeof IsRouteIgnoredRequestParser>;

/**
 * Response object for IsRouteIgnored
 */
export interface IsRouteIgnoredResponse {
  data: {
    /**
     * Describes if route is ignored
     */
    routeIgnored: boolean;
  };
}
