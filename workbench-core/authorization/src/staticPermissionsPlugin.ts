/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from '@aws/workbench-core-logging';
import _ from 'lodash';
import { RouteNotSecuredError } from './errors/routeNotSecuredError';
import { AuthenticatedUser } from './models/authenticatedUser';
import Operation from './models/operation';
import Permission, { PermissionsMap } from './models/permission';
import RoutesMap, { HTTPMethod, RoutesIgnored } from './models/routesMap';
import PermissionsPlugin from './permissionsPlugin';

/**
 * Static Permissions Plugin.
 */
export default class StaticPermissionsPlugin implements PermissionsPlugin {
  private _permissionsMap: PermissionsMap;
  private _routesMap: RoutesMap;
  private _routesIgnored: RoutesIgnored;
  private _logger: LoggingService;
  /**
   * Creates a staticPermissionsPlugin with the following params.
   * @param permissionsMap - {@link PermissionsMap}
   * @param routesMap - {@link RoutesMap}
   * @param routesIgnored - {@link RoutesIgnored}
   * @param logger - {@link LoggingService}
   */
  public constructor(
    permissionsMap: PermissionsMap,
    routesMap: RoutesMap,
    routesIgnored: RoutesIgnored,
    logger: LoggingService
  ) {
    this._permissionsMap = permissionsMap;
    this._routesMap = routesMap;
    this._routesIgnored = routesIgnored;
    this._logger = logger;
  }

  public async getPermissionsByUser(user: AuthenticatedUser): Promise<Permission[]> {
    let permissions: Permission[] = [];
    user.roles.forEach((role: string) => {
      if (_.has(this._permissionsMap, role))
        permissions = _.concat(permissions, _.cloneDeep(_.get(this._permissionsMap, role)));
      else this._logger.warn(`The role ${role} does not have permissions mapped`);
    });
    return permissions;
  }

  public async getOperationsByRoute(route: string, method: HTTPMethod): Promise<Operation[]> {
    let methodToOperations;
    if (await this.isRouteIgnored(route, method)) {
      return [];
    } else if (_.has(this._routesMap, route)) {
      methodToOperations = _.get(_.get(this._routesMap, route), method);
    } else {
      const BreakException = {};
      try {
        _.forEach(Object.entries(this._routesMap), ([routeRegex, operations]) => {
          const match = route.match(routeRegex);
          if (match && route === match[0]) {
            methodToOperations = _.get(operations, method);
            throw BreakException;
          }
        });
      } catch (e) {
        if (e !== BreakException) throw e;
      }
    }
    if (methodToOperations !== undefined) return _.cloneDeep(methodToOperations);
    throw new RouteNotSecuredError(`Route ${method} ${route} has not been secured`);
  }
  /**
   * Checks if a route is being ignored for Authorization.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   * @returns boolean stating if the route is ignored.
   */
  public async isRouteIgnored(route: string, method: HTTPMethod): Promise<boolean> {
    return _.has(this._routesIgnored, route) && _.get(_.get(this._routesIgnored, route), method) === true;
  }
}
