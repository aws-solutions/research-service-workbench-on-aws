import { User } from './User';

/**
 * Implement the `UserManagementPlugin` interface to connect the UserRoleService
 * to an Identity Provider or other datastore for users and roles.
 */
export interface UserManagementPlugin {
  /**
   * Get details for a particular user from the user/role data store.
   * @param uid - the identifier of a given user.
   */
  getUser(uid: string): Promise<User>;

  /**
   * Get all user IDs from the user/role data store.
   */
  listUsers(): Promise<string[]>;

  /**
   * Create a new user with the given details.
   * @param user - the details of the user to create.
   */
  createUser(user: User): Promise<void>;

  /**
   * Update a user with new details.
   * @param uid - the ID of the user to update.
   * @param user - the new details for the user.
   */
  updateUser(uid: string, user: User): Promise<void>;

  /**
   * Delete a user from the backing store.
   * @param uid - the ID of the user to delete.
   */
  deleteUser(uid: string): Promise<void>;

  /**
   * List the user IDs assoicated with a given role.
   * @param role - the role for which the users should be listed.
   */
  listUsersForRole(role: string): Promise<string[]>;

  /**
   * List the currenlty available roles.
   */
  listRoles(): Promise<string[]>;

  /**
   * Add the given user to the given role.
   * @param uid - the ID of the user to add to the role.
   * @param role - the name which identifies the role.
   */
  addUserToRole(uid: string, role: string): Promise<void>;

  /**
   * Create a new role with no associated users.
   * @param role - the name of the role to create.
   */
  createRole(role: string): Promise<void>;

  /**
   * Remove the given user from the given role.
   * @param uid - the ID of the user to remove from the given role.
   * @param role - the role from which the user is to be removed.
   */
  removeUserFromRole(uid: string, role: string): Promise<void>;

  /**
   * Delete the given role. It is recommended implementers check to
   * ensure an empty role before deletion to help guard against accidental
   * deletin.
   * @param role - the role to remove.
   */
  deleteRole(role: string): Promise<void>;
}
