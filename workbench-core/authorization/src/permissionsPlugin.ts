/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from './models/authenticatedUser';
import Operation from './models/operation';
import Permission from './models/permission';
import { HTTPMethod } from './models/routesMap';

/**
 * Represents the PermissionsPlugin.
 */
export default interface PermissionsPlugin {
  /**
   * Returns a set of {@link Permission} given a {@link AuthenticatedUser}.
   * @param user - {@link AuthenticatedUser}
   *
   * @returns A Promise for a set of the {@link AuthenticatedUser}'s {@link Permission}.
   */
  getPermissionsByUser(user: AuthenticatedUser): Promise<Permission[]>;

  /**
   * Returns a set of {@link Operation} given a Route and {@link HTTPMethod}.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   *
   * @returns A set of {@link Operation}s associated to the route.
   *
   * @throws - {@link RouteNotSecuredError} when route is not secured
   */
  getOperationsByRoute(route: string, method: HTTPMethod): Promise<Operation[]>;

  /**
   * Checks if a route is being ignored for Authorization.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   * @returns boolean stating if the route is ignored.
   */
  isRouteIgnored(route: string, method: HTTPMethod): Promise<boolean>;
}
