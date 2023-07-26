/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuthorizationPlugin from './authorizationPlugin';
import { ForbiddenError } from './errors/forbiddenError';
import { AuthenticatedUser } from './models/authenticatedUser';
import Operation from './models/operation';
import Permission from './models/permission';
import { HTTPMethod } from './models/routesMap';
import PermissionsPlugin from './permissionsPlugin';

/**
 * Authorization Service.
 */
export default class AuthorizationService {
  private _authorizationPlugin: AuthorizationPlugin;
  private _permissionsPlugin: PermissionsPlugin;
  /**
   * Authorization Service constructor.
   * @param authorizationPlugin - {@link AuthorizationPlugin}.
   * @param permissionsPlugin - {@link PermissionsPlugin}.
   */
  public constructor(authorizationPlugin: AuthorizationPlugin, permissionsPlugin: PermissionsPlugin) {
    this._authorizationPlugin = authorizationPlugin;
    this._permissionsPlugin = permissionsPlugin;
  }

  /**
   * Checks whether a {@link AuthenticatedUser} is authorized to utilize a {@link HTTPMethod} on a route.
   * @param user - {@link AuthenticatedUser}.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   *
   * @throws Forbidden {@link Error} when {@link User} is not authorized
   */
  public async isAuthorizedOnRoute(
    user: AuthenticatedUser,
    route: string,
    method: HTTPMethod
  ): Promise<void> {
    try {
      const permissions: Permission[] = await this._permissionsPlugin.getPermissionsByUser(user);
      const operations: Operation[] = await this._permissionsPlugin.getOperationsByRoute(route, method);

      await this._authorizationPlugin.isAuthorized(permissions, operations);
    } catch (err) {
      throw new ForbiddenError(`User is forbidden: ${err.message}`);
    }
  }

  /**
   * Checks if a route is being ignored for Authorization.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   * @returns boolean stating if the route is ignored.
   */
  public async isRouteIgnored(route: string, method: HTTPMethod): Promise<boolean> {
    return this._permissionsPlugin.isRouteIgnored(route, method);
  }
}
