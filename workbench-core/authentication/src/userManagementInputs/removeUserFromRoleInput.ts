/**
 * Input for removeUserFromRole.
 */
export interface RemoveUserFromRoleInput {
  /**
   * The ID of the user to remove from the given role.
   */
  uid: string;
  /**
   * The role from which the user is to be removed.
   */
  role: string;
}
