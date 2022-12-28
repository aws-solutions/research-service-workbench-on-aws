/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AddUserToGroupRequest, AddUserToGroupResponse } from './dynamicAuthorizationInputs/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/createIdentityPermissions';
import { DeleteGroupRequest, DeleteGroupResponse } from './dynamicAuthorizationInputs/deleteGroup';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/deleteIdentityPermissions';
import { DoesGroupExistRequest, DoesGroupExistResponse } from './dynamicAuthorizationInputs/doesGroupExist';
import { GetGroupUsersRequest, GetGroupUsersResponse } from './dynamicAuthorizationInputs/getGroupUsers';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsBySubject';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import { InitRequest, InitResponse } from './dynamicAuthorizationInputs/init';
import { IsAuthorizedOnRouteRequest } from './dynamicAuthorizationInputs/isAuthorizedOnRoute';
import { IsAuthorizedOnSubjectRequest } from './dynamicAuthorizationInputs/isAuthorizedOnSubject';
import { IsRouteIgnoredRequest, IsRouteIgnoredResponse } from './dynamicAuthorizationInputs/isRouteIgnored';
import {
  IsRouteProtectedRequest,
  IsRouteProtectedResponse
} from './dynamicAuthorizationInputs/isRouteProtected';
import {
  IsUserAssignedToGroupRequest,
  IsUserAssignedToGroupResponse
} from './dynamicAuthorizationInputs/isUserAssignedToGroup';
import {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicAuthorizationInputs/removeUserFromGroup';
import { GroupManagementPlugin } from './groupManagementPlugin';

export class DynamicAuthorizationService {
  private _groupManagementPlugin: GroupManagementPlugin;

  public constructor(config: { groupManagementPlugin: GroupManagementPlugin }) {
    this._groupManagementPlugin = config.groupManagementPlugin;
  }

  /**
   * Initialize Dynamic Authorization Service
   * @param initRequest - {@link InitRequest}
   *
   * @returns - {@link InitResponse}
   */
  public async init(initRequest: InitRequest): Promise<InitResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether a {@link AuthenticatedUser} is authorized to perform {@link isAuthorizedOnSubjectRequest}
   * @param isAuthorizedOnSubjectRequest - {@link IsAuthorizedOnSubjectRequest}
   *
   * @throws - {@link ForbiddenError} when {@link AuthenticatedUser} is not authorized.
   */
  public async isAuthorizedOnSubject(
    isAuthorizedOnSubjectRequest: IsAuthorizedOnSubjectRequest
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Checks if a route is ignored
   * @param isRouteIgnoredRequest - {@link IsRouteIgnoredRequest}
   *
   * @returns - {@link IsRouteIgnoredResponse}
   */
  public async isRouteIgnored(isRouteIgnoredRequest: IsRouteIgnoredRequest): Promise<IsRouteIgnoredResponse> {
    throw new Error('Not implemented');
  }
  /**
   * Checks if a route is protected
   * @param isRouteProtectedRequest - {@link IsRouteProtectedRequest}
   *
   * @returns - {@link IsRouteProtectedResponse}
   */
  public async isRouteProtected(
    isRouteProtectedRequest: IsRouteProtectedRequest
  ): Promise<IsRouteProtectedResponse> {
    throw new Error('Not implemented');
  }
  /**
   * Checks whether a {@link AuthenticatedUser} is authorized on a route
   * @param isAuthorizedOnRouteRequest - {@link IsAuthorizedOnRouteRequest}
   *
   * @throws - {@link ForbiddenError} when {@link AuthenticatedUser} is not authorized.
   *
   */
  public async isAuthorizedOnRoute(isAuthorizedOnRouteRequest: IsAuthorizedOnRouteRequest): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Create an authorization group
   * @param createGroupRequest - {@link CreateGroupRequest}
   *
   * @returns a {@link CreateGroupResponse}
   *
   * @throws {@link GroupAlreadyExistsError} - Can not create a group that already exists
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async createGroup(createGroupRequest: CreateGroupRequest): Promise<CreateGroupResponse> {
    const response = await this._groupManagementPlugin.createGroup(createGroupRequest);
    await this._groupManagementPlugin.setGroupStatus({
      groupId: createGroupRequest.groupId,
      status: 'active'
    });
    return response;
  }

  /**
   * Delete an authorization group
   * @param deleteGroupRequest - {@link DeleteGroupRequest}
   *
   * @returns - {@link DeleteGroupResponse}
   */
  public async deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Create identity permissions
   * @param createIdentityPermissionsRequest - {@link CreateIdentityPermissionsRequest}
   *
   * @returns - {@link CreateIdentityPermissionsResponse}
   *
   * @throws - {@link IdentityPermissionAlreadyExistsError} Can not create an identity permission that already exists.
   */
  public async createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Delete identity permissions
   * @param deleteIdentityPermissionsRequest - {@link DeleteIdentityPermissionsRequest}
   *
   * @returns - {@link DeleteIdentityPermissionsResponse}
   */
  public async deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Get all identity permissions associated to a specific subject
   * @param getIdentityPermissionsBySubjectRequest - {@link GetIdentityPermissionsBySubjectRequest}
   *
   * @returns - {@link GetIdentityPermissionsBySubjectResponse}
   */
  public async getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Add a user to an authorization group
   * @param addUserToGroupRequest - {@link AddUserToGroupRequest}
   *
   * @returns - {@link AddUserToGroupResponse}
   */
  public async addUserToGroup(addUserToGroupRequest: AddUserToGroupRequest): Promise<AddUserToGroupResponse> {
    return this._groupManagementPlugin.addUserToGroup(addUserToGroupRequest);
  }

  /**
   * Remove a user from an authorization group
   * @param removeUserFromGroupRequest - {@link RemoveUserFromGroupRequest}
   *
   * @returns - {@link RemoveUserFromGroupResponse}
   */
  public async removeUserFromGroup(
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Get all users associated to the group
   * @param getGroupUsersRequest - {@link GetGroupUsersRequest}
   *
   * @returns - {@link GetGroupUsersResponse}
   */
  public async getGroupUsers(getGroupUsersRequest: GetGroupUsersRequest): Promise<GetGroupUsersResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Get all groups associated to the user
   * @param getUserGroupsRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUserGroupsResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   */
  public async getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    return await this._groupManagementPlugin.getUserGroups(getUserGroupsRequest);
  }

  /**
   * Check if a user is assigned to a group
   * @param isUserAssignedToGroupRequest - {@link IsUserAssignedToGroupRequest}
   */
  public async isUserAssignedToGroup(
    isUserAssignedToGroupRequest: IsUserAssignedToGroupRequest
  ): Promise<IsUserAssignedToGroupResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Check if a group exist
   * @param doesGroupExistRequest - {@link DoesGroupExistRequest}
   *
   * @returns - {@link DoesGroupExistResponse}
   */
  public async doesGroupExist(doesGroupExistRequest: DoesGroupExistRequest): Promise<DoesGroupExistResponse> {
    throw new Error('Not implemented');
  }
}
