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
import { UserManagementPlugin } from './userManagementPlugin';
/**
 *
 */
export class UserManagementService {
  private _userManagementPlugin: UserManagementPlugin;

  public constructor(userManagementPlugin: UserManagementPlugin) {
    this._userManagementPlugin = userManagementPlugin;
  }
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
  public async getUser(id: string): Promise<User> {
    return this._userManagementPlugin.getUser(id);
  }
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
  public async createUser(user: CreateUser): Promise<User> {
    return await this._userManagementPlugin.createUser(user);
  }
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
  public async updateUser(id: string, user: User): Promise<void> {
    await this._userManagementPlugin.updateUser(id, user);
  }

  /**
   * Delete a user from the backing store.
   * @param id - the ID of the user to delete.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  public async deleteUser(id: string): Promise<void> {
    await this._userManagementPlugin.deleteUser(id);
  }

  /**
   * Activates an inactive user from the backing store.
   *
   * @param id - the id of the user to activate
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  public async activateUser(id: string): Promise<void> {
    await this._userManagementPlugin.activateUser(id);
  }

  /**
   * Deactivates an active user from the backing store.
   *
   * @param id - the id of the user to deactivate
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  public async deactivateUser(id: string): Promise<void> {
    await this._userManagementPlugin.deactivateUser(id);
  }

  /**
   * Get all user IDs from the user/role data store.
   * @returns an array of {@link User}s
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   */
  public async listUsers(): Promise<User[]> {
    return this._userManagementPlugin.listUsers();
  }

  /**
   * List the user IDs associated with a given role.
   * @param role - the role for which the users should be listed.
   * @returns an array containing the user ids that are associated with the role
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleNotFoundError} - role could not be found
   */
  public async listUsersForRole(role: string): Promise<string[]> {
    return this._userManagementPlugin.listUsersForRole(role);
  }

  /**
   * List the currently available roles.
   *
   * @returns an array containing all available roles
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   */
  public async listRoles(): Promise<string[]> {
    return this._userManagementPlugin.listRoles();
  }

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
  public async addUserToRole(id: string, role: string): Promise<void> {
    await this._userManagementPlugin.addUserToRole(id, role);
  }
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
  public async removeUserFromRole(id: string, role: string): Promise<void> {
    await this._userManagementPlugin.removeUserFromRole(id, role);
  }

  /**
   * Create a new role with no associated users.
   * @param role - the name of the role to create.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleAlreadyExistsError} - role already exists error
   */
  public async createRole(role: string): Promise<void> {
    await this._userManagementPlugin.createRole(role);
  }
  /**
   * Delete the given role. It is recommended implementers check to
   * ensure an empty role before deletion to help guard against accidental
   * deletion.
   * @param role - the role to remove.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleNotFoundError} - role could not be found
   */
  public async deleteRole(role: string): Promise<void> {
    await this._userManagementPlugin.deleteRole(role);
  }
}
