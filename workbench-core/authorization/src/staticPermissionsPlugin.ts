import { User } from '@amzn/workbench-core-authentication';
import PermissionsPlugin, { Permission, PermissionsMap } from './permissionsPlugin';

/**
 * Static Permissions Plugin.
 */
export default class StaticPermissionsPlugin implements PermissionsPlugin {
  private _permissionsMap: PermissionsMap;
  /**
   * Creates a staticPermissionsPlugin using a {@link PermissionsMap}.
   * @param permissionsMap - {@link PermissionsMap}
   */
  public constructor(permissionsMap: PermissionsMap) {
    this._permissionsMap = permissionsMap;
  }

  public async getPermissionsByUser(user: User): Promise<Permission[]> {
    let permissions: Permission[] = [];
    user.roles.forEach((role: string) => {
      if (this._permissionsMap.hasOwnProperty(role)) {
        permissions = permissions.concat(this._permissionsMap[`${role}`]);
      } else {
        throw new Error('Trying to access unknown role');
      }
    });
    return permissions;
  }
}
