/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { buildDynamoDBPkSk } from '@aws/workbench-core-base/lib';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import {
  isRoleAlreadyExistsError,
  isRoleNotFoundError,
  PluginConfigurationError,
  TooManyRequestsError,
  UserManagementService
} from '@aws/workbench-core-user-management';
import { ForbiddenError } from '../errors/forbiddenError';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError, isGroupNotFoundError } from '../errors/groupNotFoundError';

import { AddUserToGroupRequest, AddUserToGroupResponse } from './dynamicAuthorizationInputs/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { DeleteGroupRequest, DeleteGroupResponse } from './dynamicAuthorizationInputs/deleteGroup';
import { GetGroupStatusRequest, GetGroupStatusResponse } from './dynamicAuthorizationInputs/getGroupStatus';
import { GetGroupUsersRequest, GetGroupUsersResponse } from './dynamicAuthorizationInputs/getGroupUsers';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import {
  IsUserAssignedToGroupRequest,
  IsUserAssignedToGroupResponse
} from './dynamicAuthorizationInputs/isUserAssignedToGroup';
import {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicAuthorizationInputs/removeUserFromGroup';
import { SetGroupStatusRequest, SetGroupStatusResponse } from './dynamicAuthorizationInputs/setGroupStatus';
import { GroupManagementPlugin } from './groupManagementPlugin';
import { GroupMetadata, GroupMetadataParser } from './models/GroupMetadata';

/**
 * A WBCGroupManagementPlugin instance that interfaces with Workbench Core's UserManagementService to provide group management.
 */
export class WBCGroupManagementPlugin implements GroupManagementPlugin {
  private _userManagementService: UserManagementService;
  private _ddbService: DynamoDBService;
  private _userGroupKeyType: string;

  public constructor(config: {
    userManagementService: UserManagementService;
    ddbService: DynamoDBService;
    userGroupKeyType: string;
  }) {
    this._userManagementService = config.userManagementService;
    this._ddbService = config.ddbService;
    this._userGroupKeyType = config.userGroupKeyType;
  }
  public async createGroup(request: CreateGroupRequest): Promise<CreateGroupResponse> {
    const { groupId } = request;

    try {
      const { data } = await this.getGroupStatus(request);
      if (data.status === 'delete_pending' || data.status === 'active') {
        throw new GroupAlreadyExistsError(`Group '${groupId}' already exists.`);
      }
    } catch (error) {
      if (!isGroupNotFoundError(error)) {
        throw error;
      }
    }

    try {
      await this._userManagementService.createRole(groupId);
      await this.setGroupStatus({ groupId, status: 'active' });

      return { data: { groupId } };
    } catch (error) {
      if (isRoleAlreadyExistsError(error)) {
        //Do not throw error, group can already exist but not exist in Dynamic Authz
        await this.setGroupStatus({ groupId, status: 'active' });
        return { data: { groupId } };
      }
      throw error;
    }
  }
  public async deleteGroup({ groupId }: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    try {
      await this._userManagementService.deleteRole(groupId);

      return { data: { groupId } };
    } catch (error) {
      if (isRoleNotFoundError(error)) {
        throw new GroupNotFoundError(error.message);
      }
      throw error;
    }
  }
  public async getUserGroups(request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    const { userId } = request;

    const groupIds = await this._userManagementService.getUserRoles(userId);
    return {
      data: {
        groupIds
      }
    };
  }
  public async getGroupUsers(request: GetGroupUsersRequest): Promise<GetGroupUsersResponse> {
    const { groupId } = request;

    try {
      const userIds = await this._userManagementService.listUsersForRole(groupId);
      return {
        data: {
          userIds
        }
      };
    } catch (error) {
      if (isRoleNotFoundError(error)) {
        throw new GroupNotFoundError(error.message);
      }
      throw error;
    }
  }
  public async addUserToGroup(request: AddUserToGroupRequest): Promise<AddUserToGroupResponse> {
    const { groupId, userId } = request;

    // ToDo: Audit authenticatedUser which actor is performing operation

    try {
      const {
        data: { status }
      } = await this.getGroupStatus({ groupId });

      if (status === 'delete_pending') {
        throw new GroupNotFoundError(
          `Cannot assign user to group '${groupId}'. The group is pending delete.`
        );
      }

      await this._userManagementService.addUserToRole(userId, groupId);
      return { data: { userId, groupId } };
    } catch (error) {
      if (isRoleNotFoundError(error)) {
        throw new GroupNotFoundError(error.message);
      }
      throw error;
    }
  }
  public async isUserAssignedToGroup(
    request: IsUserAssignedToGroupRequest
  ): Promise<IsUserAssignedToGroupResponse> {
    const { data } = await this.getUserGroups(request);
    const isAssigned = data.groupIds.includes(request.groupId);
    return { data: { isAssigned } };
  }
  public async removeUserFromGroup(
    request: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    const { groupId, userId } = request;

    try {
      await this._userManagementService.removeUserFromRole(userId, groupId);
      return { data: { userId, groupId } };
    } catch (error) {
      if (isRoleNotFoundError(error)) {
        throw new GroupNotFoundError(error.message);
      }
      throw error;
    }
  }
  public async getGroupStatus(request: GetGroupStatusRequest): Promise<GetGroupStatusResponse> {
    const { groupId } = request;

    try {
      const response = (await this._ddbService
        .get(buildDynamoDBPkSk(groupId, this._userGroupKeyType))
        .strong() // Need a strongly consistent read since this is acting as a lock on the group
        .execute()) as GetItemCommandOutput;

      if (!response.Item) {
        throw new GroupNotFoundError(`Group "${groupId}" doesnt exist in the provided DDB table.`);
      }

      const { status } = GroupMetadataParser.parse(response.Item);

      return { data: { status } };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'ProvisionedThroughputExceededException' || error.name === 'RequestLimitExceeded') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }
  public async setGroupStatus(request: SetGroupStatusRequest): Promise<SetGroupStatusResponse> {
    const { groupId, status: newStatus } = request;

    try {
      const statusResult = await this.getGroupStatus(request);
      const currentStatus = statusResult.data.status;

      if (currentStatus === 'delete_pending' && newStatus === 'active') {
        throw new ForbiddenError(`Cannot set group '${groupId}' status to active. It is pending delete.`);
      }
    } catch (error) {
      if (!isGroupNotFoundError(error)) {
        throw error;
      }
    }

    try {
      const item: GroupMetadata = {
        id: groupId,
        status: newStatus
      };

      await this._ddbService
        .update({
          key: buildDynamoDBPkSk(groupId, this._userGroupKeyType),
          params: {
            item
          }
        })
        .execute();

      return { data: { status: newStatus } };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'ProvisionedThroughputExceededException' || error.name === 'RequestLimitExceeded') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }
}
