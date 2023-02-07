/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { AuthenticatedUserParser } from '../../models/authenticatedUser';
import { HTTPMethodParser } from '../../models/routesMap';

// eslint-disable-next-line @rushstack/typedef-var
export const IsAuthorizedOnRouteRequestParser = z.object({
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUserParser,
  /**
   * The route the user is requesting access to
   */
  route: z.string(),
  /**
   * {@link HTTPMethod}
   */
  method: HTTPMethodParser,
  /**
   * Optional params for variable based operations
   */
  params: z.record(z.string()).optional()
});

/**
 * Request object for IsAuthorizedOnRoute
 */
export type IsAuthorizedOnRouteRequest = z.infer<typeof IsAuthorizedOnRouteRequestParser>;
