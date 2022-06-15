import { LoggingService } from '@amzn/workbench-core-logging';
import _ from 'lodash';
import { AuthenticatedUser } from './authenticatedUser';
import Operation from './operation';
import Permission, { PermissionsMap } from './permission';
import PermissionsPlugin from './permissionsPlugin';
import RoutesMap, { HTTPMethod, RoutesIgnored } from './routesMap';

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
    if (this._isRouteIgnored(route, method)) {
      return [];
    } else if (_.has(this._routesMap, route)) {
      const methodToOperations = _.get(_.get(this._routesMap, route), method);
      if (methodToOperations !== undefined) return _.cloneDeep(methodToOperations);
    }
    throw new Error('Route has not been secured');
  }
  /**
   * Checks if a route is being ignored for Authorization.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   * @returns boolean stating if the route is ignored.
   */
  private _isRouteIgnored(route: string, method: HTTPMethod): boolean {
    return _.has(this._routesIgnored, route) && _.get(_.get(this._routesIgnored, route), method) === true;
  }
}
