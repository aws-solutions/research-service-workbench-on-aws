import { User } from './user';
import { AddUserToRoleInput } from './userManagementInputs/addUserToRoleInput';
import { CreateRoleInput } from './userManagementInputs/createRoleInput';
import { CreateUserInput } from './userManagementInputs/createUserInput';
import { DeleteRoleInput } from './userManagementInputs/deleteRoleInput';
import { DeleteUserInput } from './userManagementInputs/deleteUserInput';
import { GetUserInput } from './userManagementInputs/getUserInput';
import { ListUsersForRoleInput } from './userManagementInputs/listUsersForRoleInput';
import { RemoveUserFromRoleInput } from './userManagementInputs/removeUserFromRoleInput';
import { UpdateUserInput } from './userManagementInputs/updateUserInput';

/**
 * Implement the `UserManagementPlugin` interface to connect the UserRoleService
 * to an Identity Provider or other datastore for users and roles.
 */
export interface UserManagementPlugin {
  /**
   * Get details for a particular user from the user/role data store.
   * @param getUserInput - {@link GetUserInput}.
   */
  getUser(getUserInput: GetUserInput): Promise<User>;

  /**
   * Get all user IDs from the user/role data store.
   */
  listUsers(): Promise<string[]>;

  /**
   * Create a new user with the given details.
   * @param createUserInput - {@link CreateUserInput}.
   */
  createUser(createUserInput: CreateUserInput): Promise<void>;

  /**
   * Update a user with new details.
   * @param updateUserInput - {@link UpdateUserInput}.
   */
  updateUser(updateUserInput: UpdateUserInput): Promise<void>;

  /**
   * Delete a user from the backing store.
   * @param deleteUserInput - {@link DeleteUserInput}.
   */
  deleteUser(deleteUserInput: DeleteUserInput): Promise<void>;

  /**
   * List the user IDs assoicated with a given role.
   * @param listUsersForRoleInput - {@link ListUsersForRoleInput}.
   */
  listUsersForRole(listUsersForRoleInput: ListUsersForRoleInput): Promise<string[]>;

  /**
   * List the currenlty available roles.
   */
  listRoles(): Promise<string[]>;

  /**
   * Add the given user to the given role.
   * @param addUserToRoleInput -  {@link AddUserToRoleInput}
   */
  addUserToRole(addUserToRoleInput: AddUserToRoleInput): Promise<void>;

  /**
   * Create a new role with no associated users.
   * @param createRoleInput - {@link CreateRoleInput}.
   */
  createRole(createRoleInput: CreateRoleInput): Promise<void>;

  /**
   * Remove the given user from the given role.
   * @param removeUserFromRoleInput - {@link RemoveUserFromRoleInput}.
   */
  removeUserFromRole(removeUserFromRoleInput: RemoveUserFromRoleInput): Promise<void>;

  /**
   * Delete the given role. It is recommended implementers check to
   * ensure an empty role before deletion to help guard against accidental
   * deletin.
   * @param deleteRoleInput - {@link DeleteRoleInput}.
   */
  deleteRole(deleteRoleInput: DeleteRoleInput): Promise<void>;
}
