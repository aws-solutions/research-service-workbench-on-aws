import { Action } from './action';
import { Role } from './role';
/**
 *
 */
export interface Permission {
  /**
   *
   */
  action: Action;
  /**
   *
   */
  subject: string;
}

type PermissionsMap = {
  [key in Role]?: Permission[];
};
/**
 *
 */
export default interface PermissionsPlugin {
  /**
   *
   */
  permissionsMap: PermissionsMap;
  /**
   *
   * @param role -
   */
  getPermissionsByRole(role: Role): Promise<Permission[]>;
}
