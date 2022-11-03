/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../authenticatedUser';
import AuthorizationPlugin from '../authorizationPlugin';
import { DynamicOperation } from '../operation';
import { DynamicPermissionsPlugin } from './dynamicPermissionsPlugin';
import {
  AssignUserToGroupRequest,
  AssignUserToGroupResponse
} from './dynamicPermissionsPluginInputs/assignUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicPermissionsPluginInputs/createGroup';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './dynamicPermissionsPluginInputs/createIdentityPermissions';
import { DeleteGroupRequest, DeleteGroupResponse } from './dynamicPermissionsPluginInputs/deleteGroup';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicPermissionsPluginInputs/deleteIdentityPermissions';
import {
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse
} from './dynamicPermissionsPluginInputs/deleteSubjectPermissions';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './dynamicPermissionsPluginInputs/getUserGroups';
import {
  GetUsersFromGroupRequest,
  GetUsersFromGroupResponse
} from './dynamicPermissionsPluginInputs/getUsersFromGroup';
import { Identity, IdentityPermission } from './dynamicPermissionsPluginInputs/identityPermission';
import {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicPermissionsPluginInputs/removeUserFromGroup';

/**
 * Request object for DynamicAuthorizationService's isAuthorizedOnSubjectRequest
 */
export interface IsAuthorizedOnSubjectRequest {
  /**
   * {@link DynamicOperation}
   */
  dynamicOperation: DynamicOperation;
}

export class DynamicAuthorizationService {
  private _dynamicPermissisonsPlugin: DynamicPermissionsPlugin;
  private _authorizationPlugin: AuthorizationPlugin;

  public constructor(params: {
    dynamicPermissionsPlugin: DynamicPermissionsPlugin;
    authorizationPlugin: AuthorizationPlugin;
  }) {
    this._dynamicPermissisonsPlugin = params.dynamicPermissionsPlugin;
    this._authorizationPlugin = params.authorizationPlugin;
  }

  /**
   * Checks whether a {@link AuthenticatedUser} is authorized to perform {@link isAuthorizedOnSubjectRequest}
   * @param user - {@link AuthenticatedUser}
   * @param isAuthorizedOnSubjectRequest - {@link IsAuthorizedOnSubjectRequest}
   *
   * @throws - {@link ForbiddenError} when {@link AuthenticatedUser} is not authorized.
   */
  public async isAuthorizedOnSubject(
    user: AuthenticatedUser,
    isAuthorizedOnSubjectRequest: IsAuthorizedOnSubjectRequest
  ): Promise<void> {
    const { id, roles } = user;
    const { subjectId, subjectType, action } = isAuthorizedOnSubjectRequest.dynamicOperation;
    const { groupIds } = await this._dynamicPermissisonsPlugin.getUserGroups({
      userId: id
    });
    const groupIdIdentities = Array.from(new Set<string>([...groupIds, ...roles])).map(
      (groupId): Identity => {
        return {
          identityType: 'GROUP',
          identityId: groupId
        };
      }
    );
    const userIdentity: Identity = {
      identityType: 'USER',
      identityId: id
    };
    const identities: Identity[] = [userIdentity, ...groupIdIdentities];
    //Check for subject id permissions
    const { identityPermissions } = await this._dynamicPermissisonsPlugin.getIdentityPermissionsBySubject({
      subjectType,
      subjectId,
      action,
      identities
    });
    //Check for wildcard permissions
    const { identityPermissions: wildCardIdentityPermissions } =
      await this._dynamicPermissisonsPlugin.getIdentityPermissionsBySubject({
        subjectType,
        subjectId: '*',
        action,
        identities
      });

    const allUserPermissions: IdentityPermission[] = [...identityPermissions, ...wildCardIdentityPermissions];

    await this._authorizationPlugin.isAuthorizedOnDynamicOperations(allUserPermissions, [
      isAuthorizedOnSubjectRequest.dynamicOperation
    ]);
  }
  /**
   * Create an authorization group
   * @param createGroupRequest - {@link CreateGroupRequest}
   *
   * @returns - {@link CreateGroupResponse}
   *
   * @throws - {@link GroupAlreadyExistsError} Can not create a group that already exists
   */
  public async createGroup(createGroupRequest: CreateGroupRequest): Promise<CreateGroupResponse> {
    return this._dynamicPermissisonsPlugin.createGroup(createGroupRequest);
  }
  /**
   * Delete an authorization group
   * @param deleteGroupRequest - {@link DeleteGroupRequest}
   *
   * @returns - {@link DeleteGroupResponse}
   */
  public async deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    return this._dynamicPermissisonsPlugin.deleteGroup(deleteGroupRequest);
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
    return this._dynamicPermissisonsPlugin.createIdentityPermissions(createIdentityPermissionsRequest);
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
    return this._dynamicPermissisonsPlugin.deleteIdentityPermissions(deleteIdentityPermissionsRequest);
  }
  /**
   * Delete all permissions associated to the subject
   * @param deleteSubjectPermissionsRequest - {@link DeleteSubjectPermissionsRequest}
   *
   * @returns - {@link DeleteSubjectPermissionsResponse}
   */
  public async deleteSubjectPermissions(
    deleteSubjectPermissionsRequest: DeleteSubjectPermissionsRequest
  ): Promise<DeleteSubjectPermissionsResponse> {
    return this._dynamicPermissisonsPlugin.deleteSubjectPermissions(deleteSubjectPermissionsRequest);
  }
  /**
   * Assign a user to an authorization group
   * @param assignUserToGroupRequest - {@link AssignUserToGroupRequest}
   *
   * @returns - {@link AssignUserToGroupResponse}
   */
  public async assignUserToGroup(
    assignUserToGroupRequest: AssignUserToGroupRequest
  ): Promise<AssignUserToGroupResponse> {
    return this._dynamicPermissisonsPlugin.assignUserToGroup(assignUserToGroupRequest);
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
    return await this._dynamicPermissisonsPlugin.removeUserFromGroup(removeUserFromGroupRequest);
  }
  /**
   * Get all users associated to the group
   * @param getUsersFromGroupRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUsersFromGroupResponse}
   */
  public async getUsersFromGroup(
    getUsersFromGroupRequest: GetUsersFromGroupRequest
  ): Promise<GetUsersFromGroupResponse> {
    return this._dynamicPermissisonsPlugin.getUsersFromGroup(getUsersFromGroupRequest);
  }
  /**
   * Get all groups associated to the user
   * @param getUserGroupsRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUserGroupsResponse}
   */
  public async getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    return this._dynamicPermissisonsPlugin.getUserGroups(getUserGroupsRequest);
  }
}
