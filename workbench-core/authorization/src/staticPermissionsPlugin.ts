import { User } from '@amzn/workbench-core-authentication';
import PermissionsPlugin, { Permission, PermissionsMap } from './permissionsPlugin';
import { LoggingService } from '@amzn/workbench-core-logging';

/**
 * Static Permissions Plugin.
 */
export default class StaticPermissionsPlugin implements PermissionsPlugin {
  private _permissionsMap: PermissionsMap;
  private _logger: LoggingService;
  /**
   * Creates a staticPermissionsPlugin using a {@link PermissionsMap}.
   * @param permissionsMap - {@link PermissionsMap}
   */
  public constructor(permissionsMap: PermissionsMap, logger: LoggingService) {
    this._permissionsMap = permissionsMap;
    this._logger = logger;
  }

  public async getPermissionsByUser(user: User): Promise<Permission[]> {
    let permissions: Permission[] = [];
    user.roles.forEach((role: string) => {
      if (this._permissionsMap.hasOwnProperty(role))
        permissions = permissions.concat(this._permissionsMap[`${role}`]);
      else this._logger.warn(`The role ${role} does not have permissions mapped`);
    });
    return permissions;
  }
}
