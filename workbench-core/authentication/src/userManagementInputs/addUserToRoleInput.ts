/**
 * Input for AddUserToRole.
 */
export interface AddUserToRoleInput {
  /**
   * The ID of the user to add to the role.
   */
  uid: string;

  /**
   * The name which identifies the role.
   */
  role: string;
}
