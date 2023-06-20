/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// disabling because the tsdoc links need the imports to work
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ListUsersForRoleRequest, PaginatedResponse } from '@aws/workbench-core-base';
import { IdpUnavailableError } from './errors/idpUnavailableError';
import { InvalidParameterError } from './errors/invalidParameterError';
import { PluginConfigurationError } from './errors/pluginConfigurationError';
import { RoleAlreadyExistsError } from './errors/roleAlreadyExistsError';
import { RoleNotFoundError } from './errors/roleNotFoundError';
import { UserAlreadyExistsError } from './errors/userAlreadyExistsError';
import { UserNotFoundError } from './errors/userNotFoundError';
/* eslint-enable @typescript-eslint/no-unused-vars */
import { CreateUser, User } from './user';
import { ListUsersRequest } from './users/listUsersRequest';
import { ListUsersResponse } from './users/listUsersResponse';

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
   * @throws {@link TooManyRequestsError} - the request was rate limited
   */
  getUser(id: string): Promise<User>;

  /**
   * Gets the roles for a certain user.
   *
   * @param id - the user id to get roles for
   * @returns an array of the user's roles
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link TooManyRequestsError} - the request was rate limited
   */
  getUserRoles(id: string): Promise<string[]>;

  /**
   * Create a new user with the given details.
   * @param user - the details of the user to create.
   * @returns the created {@link User}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserAlreadyExistsError} - user already exists error
   * @throws {@link InvalidParameterError} - {@link User} provided is invalid
   * @throws {@link TooManyRequestsError} - the request was rate limited
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
   * @throws {@link TooManyRequestsError} - the request was rate limited
   */
  updateUser(id: string, user: User): Promise<void>;

  /**
   * Delete a user from the backing store.
   * @param id - the ID of the user to delete.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link TooManyRequestsError} - the request was rate limited
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
   * @throws {@link TooManyRequestsError} - the request was rate limited
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
   * @throws {@link TooManyRequestsError} - the request was rate limited
   */
  deactivateUser(id: string): Promise<void>;

  /**
   * Get all user IDs from the user/role data store.
   * @param request - the request object according to {@link ListUsersRequest}
   * @returns a {@link ListUsersResponse} object
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link TooManyRequestsError} - the request was rate limited
   * @throws {@link InvalidPaginationTokenError} if the passed pagination token is invalid
   */
  listUsers(request: ListUsersRequest): Promise<ListUsersResponse>;

  /**
   * List the user IDs assoicated with a given role.
   * @param request - a ListUsersForRoleRequest object
   * @returns a paginated response the user ids that are associated with the role
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleNotFoundError} - role could not be found
   * @throws {@link TooManyRequestsError} - the request was rate limited
   */
  listUsersForRole(request: ListUsersForRoleRequest): Promise<PaginatedResponse<string>>;

  /**
   * List the currently available roles.
   *
   * @returns an array containing all available roles
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link TooManyRequestsError} - the request was rate limited
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
   * @throws {@link TooManyRequestsError} - the request was rate limited
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
   * @throws {@link TooManyRequestsError} - the request was rate limited
   */
  removeUserFromRole(id: string, role: string): Promise<void>;

  /**
   * Create a new role with no associated users.
   * @param role - the name of the role to create.
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link RoleAlreadyExistsError} - role already exists error
   * @throws {@link TooManyRequestsError} - the request was rate limited
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
   * @throws {@link TooManyRequestsError} - the request was rate limited
   */
  deleteRole(role: string): Promise<void>;

  /**
   * Validate user roles to ensure given/revoked roles are modified.
   * @param userId - ID of the user to be validated
   * @param roles - roles of the user to be validated
   *
   * @returns - a list of validated user roles
   */
  validateUserRoles(userId: string, roles: string[]): Promise<string[]>;
}
