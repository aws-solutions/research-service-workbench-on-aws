/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// disabling because the tsdoc links need the imports to work
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IdpUnavailableError } from './errors/idpUnavailableError';
import { InvalidParameterError } from './errors/invalidParameterError';
import { PluginConfigurationError } from './errors/pluginConfigurationError';
import { RoleAlreadyExistsError } from './errors/roleAlreadyExistsError';
import { RoleNotFoundError } from './errors/roleNotFoundError';
import { UserAlreadyExistsError } from './errors/userAlreadyExistsError';
import { UserNotFoundError } from './errors/userNotFoundError';
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CreateUser, User } from './user';

/**
 * Implement the `UserManagementPlugin` interface to connect the UserRoleService
 * to an Identity Provider or other datastore for users and roles.
 */
export interface UserManagementPlugin {
  /**
   * Get details for a particular user from the user/role data store.
   *
   * @param id - the identifier of a given user.
   * @returns a {@link User} object containing the user's details
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  getUser(id: string): Promise<User>;

  /**
   * Create a new user with the given details.
   * @param user - the details of the user to create.
   * @returns the created {@link User}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserAlreadyExistsError} - user already exists error
   * @throws {@link InvalidParameterError} - {@link User} provided is invalid
   */
  createUser(user: CreateUser): Promise<User>;

  /**
   * Update a user with new details.
   * @param id - the ID of the user to update.
   * @param user - the new details for the user.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link InvalidParameterError} - {@link User} provided is invalid
   */
  updateUser(id: string, user: User): Promise<void>;

  /**
   * Delete a user from the backing store.
   * @param id - the ID of the user to delete.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  deleteUser(id: string): Promise<void>;

  /**
   * Activates an inactive user.
   *
   * @param id - the id of the user to activate
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  activateUser(id: string): Promise<void>;

  /**
   * Deactivates an active user.
   *
   * @param id - the id of the user to deactivate
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  deactivateUser(id: string): Promise<void>;

  /**
   * Get all user IDs from the user/role data store.
   * @returns an array of {@link User}s
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   */
  listUsers(): Promise<User[]>;

  /**
   * List the user IDs assoicated with a given role.
   * @param role - the role for which the users should be listed.
   * @returns an array containing the user ids that are associated with the role
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleNotFoundError} - role could not be found
   */
  listUsersForRole(role: string): Promise<string[]>;

  /**
   * List the currenlty available roles.
   *
   * @returns an array containing all available roles
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   */
  listRoles(): Promise<string[]>;

  /**
   * Add the given user to the given role.
   * @param id - the ID of the user to add to the role.
   * @param role - the name which identifies the role.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link RoleNotFoundError} - role could not be found
   */
  addUserToRole(id: string, role: string): Promise<void>;

  /**
   * Remove the given user from the given role.
   * @param id - the ID of the user to remove from the given role.
   * @param role - the role from which the user is to be removed.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link RoleNotFoundError} - role could not be found
   */
  removeUserFromRole(id: string, role: string): Promise<void>;

  /**
   * Create a new role with no associated users.
   * @param role - the name of the role to create.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleAlreadyExistsError} - role already exists error
   */
  createRole(role: string): Promise<void>;

  /**
   * Delete the given role. It is recommended implementers check to
   * ensure an empty role before deletion to help guard against accidental
   * deletin.
   * @param role - the role to remove.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleNotFoundError} - role could not be found
   */
  deleteRole(role: string): Promise<void>;
}
