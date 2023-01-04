/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, Metadata } from '@aws/workbench-core-audit';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { AddUserToGroupRequest, AddUserToGroupResponse } from './dynamicAuthorizationInputs/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsRequestParser,
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
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import { GroupManagementPlugin } from './groupManagementPlugin';

export class DynamicAuthorizationService {
  private _groupManagementPlugin: GroupManagementPlugin;
  private _dynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
  private _auditService: AuditService;

  public constructor(config: {
    groupManagementPlugin: GroupManagementPlugin;
    dynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
    auditService: AuditService;
  }) {
    this._groupManagementPlugin = config.groupManagementPlugin;
    this._dynamicAuthorizationPermissionsPlugin = config.dynamicAuthorizationPermissionsPlugin;
    this._auditService = config.auditService;
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
    const metadata: Metadata = {
      actor: createGroupRequest.authenticatedUser,
      action: this.createGroup.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: createGroupRequest
    };

    try {
      const response = await this._groupManagementPlugin.createGroup(createGroupRequest);

      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (error) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, error);

      throw error;
    }
  }

  /**
   * Delete an authorization group
   * @param deleteGroupRequest - {@link DeleteGroupRequest}
   *
   * @returns - {@link DeleteGroupResponse}
   */
  public async deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    throw new Error('Not implemented');

    // TODO audit
  }

  /**
   * Create identity permissions, limited to 100 identity permissions
   * @param createIdentityPermissionsRequest - {@link CreateIdentityPermissionsRequest}
   *
   * @returns - {@link CreateIdentityPermissionsResponse}
   *
   * @throws - {@link IdentityPermissionAlreadyExistError} Can not create an identity permission that already exists.
   * @throws - {@link ThroughputExceededError} Can not exceed 100 identity permissions
   * @throws - {@link GroupNotValid} Can only create permissions for 'active' groups
   */
  public async createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    createIdentityPermissionsRequest = CreateIdentityPermissionsRequestParser.parse(
      createIdentityPermissionsRequest
    );
    const { authenticatedUser } = createIdentityPermissionsRequest;
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.createIdentityPermissions.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: createIdentityPermissionsRequest
    };
    try {
      const response = await this._createIdentityPermissions(createIdentityPermissionsRequest);

      //Write audit entry when success
      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (err) {
      //Write audit entry when failure
      metadata.statusCode = 400;
      await this._auditService.write(metadata, err);
      throw err;
    }
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

    // TODO audit
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
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link GroupNotFoundError} - group could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async addUserToGroup(addUserToGroupRequest: AddUserToGroupRequest): Promise<AddUserToGroupResponse> {
    return this._groupManagementPlugin.addUserToGroup(addUserToGroupRequest);
  }

  /**
   * Remove a user from an authorization group
   * @param removeUserFromGroupRequest - {@link RemoveUserFromGroupRequest}
   *
   * @returns - {@link RemoveUserFromGroupResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link GroupNotFoundError} - group could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async removeUserFromGroup(
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    const metadata: Metadata = {
      actor: removeUserFromGroupRequest.authenticatedUser,
      action: this.removeUserFromGroup.name,
      source: {
        serviceName: DynamicAuthorizationService.name
      },
      requestBody: removeUserFromGroupRequest
    };

    try {
      const response = await this._groupManagementPlugin.removeUserFromGroup(removeUserFromGroupRequest);

      metadata.statusCode = 200;
      await this._auditService.write(metadata, response);

      return response;
    } catch (error) {
      metadata.statusCode = 400;
      await this._auditService.write(metadata, error);

      throw error;
    }
  }

  /**
   * Get all users associated to the group
   * @param getGroupUsersRequest - {@link GetGroupUsersRequest}
   *
   * @returns - {@link GetGroupUsersResponse}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link GroupNotFoundError} - group could not be found
   */
  public async getGroupUsers(getGroupUsersRequest: GetGroupUsersRequest): Promise<GetGroupUsersResponse> {
    return await this._groupManagementPlugin.getGroupUsers(getGroupUsersRequest);
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
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    return this._groupManagementPlugin.getUserGroups(getUserGroupsRequest);
  }

  /**
   * Check if a user is assigned to a group
   * @param isUserAssignedToGroupRequest - {@link IsUserAssignedToGroupRequest}
   *
   * @throws {@link IdpUnavailableError} - IdP encounters an error
   * @throws {@link PluginConfigurationError} - plugin has a configuration error
   * @throws {@link UserNotFoundError} - user could not be found
   * @throws {@link TooManyRequestsError} - too many requests error
   */
  public async isUserAssignedToGroup(
    isUserAssignedToGroupRequest: IsUserAssignedToGroupRequest
  ): Promise<IsUserAssignedToGroupResponse> {
    return this._groupManagementPlugin.isUserAssignedToGroup(isUserAssignedToGroupRequest);
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

  private async _createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    const { identityPermissions } = createIdentityPermissionsRequest;
    if (identityPermissions.length > 100)
      throw new ThroughputExceededError('Exceeds 100 identity permissions');

    //Verify all groups are valid to create identity permissions
    const groupIds = new Set<string>();
    identityPermissions.forEach((identityPermission) => {
      if (identityPermission.identityType === 'GROUP') groupIds.add(identityPermission.identityId);
    });
    const promises = Array.from(groupIds).map((groupId) => {
      return this._groupManagementPlugin.getGroupStatus({ groupId });
    });
    const groupStatusResponses = await Promise.all(promises);

    groupStatusResponses.forEach((groupSatusResponse) => {
      if (groupSatusResponse.data.status !== 'active')
        throw new GroupNotFoundError('One or more groups are not found');
    });

    //Create identity permissions
    return await this._dynamicAuthorizationPermissionsPlugin.createIdentityPermissions(
      createIdentityPermissionsRequest
    );
  }
}
