/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../authenticatedUser';
import { HTTPMethod } from '../../routesMap';

/**
 * Request object for IsAuthorizedOnRoute
 */
export interface IsAuthorizedOnRouteRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;

  /**
   * The route the user is requesting access to
   */
  route: string;

  /**
   * {@link HTTPMethod}
   */
  method: HTTPMethod;

  /**
   * Optional params for variable based operations
   */
  params?: Record<string, unknown>;
}
