/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AddUserToGroupRequest, AddUserToGroupResponse } from './models/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './models/createGroup';
import { DeleteGroupRequest, DeleteGroupResponse } from './models/deleteGroup';
import { DoesGroupExistRequest, DoesGroupExistResponse } from './models/doesGroupExist';
import { GetGroupStatusRequest, GetGroupStatusResponse } from './models/getGroupStatus';
import { GetGroupUsersRequest, GetGroupUsersResponse } from './models/getGroupUsers';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './models/getUserGroups';
import { IsUserAssignedToGroupRequest, IsUserAssignedToGroupResponse } from './models/isUserAssignedToGroup';
import { RemoveUserFromGroupRequest, RemoveUserFromGroupResponse } from './models/removeUserFromGroup';
import { SetGroupStatusRequest, SetGroupStatusResponse } from './models/setGroupStatus';
import { ValidateUserGroupsRequest, ValidateUserGroupsResponse } from './models/validateUserGroups';

/**
 * Implement the `GroupManagementPlugin` interface to connect the DynamicAuthorizationService
 * to an Identity Provider or other datastore for group management.
 */
export interface GroupManagementPlugin {
  /**
   * Create a new group
   *
   * @param request - {@link CreateGroupRequest}
   *
   * @returns a {@link CreateGroupResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link GroupAlreadyExistsError} - group already exists error
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  createGroup(request: CreateGroupRequest): Promise<CreateGroupResponse>;

  /**
   * Delete a group
   *
   * @param request - {@link DeleteGroupRequest}
   *
   * @returns a {@link DeleteGroupResponse}
   */
  deleteGroup(request: DeleteGroupRequest): Promise<DeleteGroupResponse>;

  /**
   * Get the groups a user is in
   *
   * @param request - {@link GetUserGroupsRequest}
   *
   * @returns a {@link GetUserGroupsResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  getUserGroups(request: GetUserGroupsRequest): Promise<GetUserGroupsResponse>;

  /**
   * Get the users of a group
   *
   * @param request - {@link GetGroupUsersRequest}
   *
   * @returns a {@link GetGroupUsersResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link GroupNotFoundError} - group could not be found
   */
  getGroupUsers(request: GetGroupUsersRequest): Promise<GetGroupUsersResponse>;

  /**
   * Add a user to a group
   *
   * @param request - {@link AddUserToGroupRequest}
   *
   * @returns a {@link AddUserToGroupResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link GroupNotFoundError} - group could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  addUserToGroup(request: AddUserToGroupRequest): Promise<AddUserToGroupResponse>;

  /**
   * Check if a user is in a group
   *
   * @param request - {@link IsUserAssignedToGroupRequest}
   *
   * @returns a {@link IsUserAssignedToGroupResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  isUserAssignedToGroup(request: IsUserAssignedToGroupRequest): Promise<IsUserAssignedToGroupResponse>;

  /**
   * Remove a user from a group
   *
   * @param request - {@link RemoveUserFromGroupRequest}
   *
   * @returns a {@link RemoveUserFromGroupResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link GroupNotFoundError} - group could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  removeUserFromGroup(request: RemoveUserFromGroupRequest): Promise<RemoveUserFromGroupResponse>;

  /**
   * Get the status of the group
   *
   * @param request - {@link GetGroupStatusRequest}
   *
   * @returns a {@link GetGroupStatusResponse}
   *
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link GroupNotFoundError} - group not found error
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  getGroupStatus(request: GetGroupStatusRequest): Promise<GetGroupStatusResponse>;

  /**
   * Set the status of the group
   *
   * @param request - {@link SetGroupStatusRequest}
   *
   * @returns a {@link SetGroupStatusResponse}
   *
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link GroupNotFoundError} - group not found error
   * @throws {@link TooManyRequestsError} - too many requests error
   * @throws {@link ForbiddenError} - invalid state transition
   */
  setGroupStatus(request: SetGroupStatusRequest): Promise<SetGroupStatusResponse>;

  /**
   * Check if a group exist
   * @param request - {@link DoesGroupExistRequest}
   *
   * @returns - {@link DoesGroupExistResponse}
   */
  doesGroupExist(request: DoesGroupExistRequest): Promise<DoesGroupExistResponse>;

  /**
   * Validate user roles to ensure given/revoked roles are modified.
   * @param request - {@link ValidateUserGroupsRequest}
   *
   * @returns - {@link ValidateUserGroupsResponse}
   */
  validateUserGroups(request: ValidateUserGroupsRequest): Promise<ValidateUserGroupsResponse>;
}
