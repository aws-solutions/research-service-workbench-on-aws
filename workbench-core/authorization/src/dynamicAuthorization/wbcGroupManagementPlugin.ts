/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { buildDynamoDBPkSk, ListUsersForRoleRequestParser } from '@aws/workbench-core-base/lib';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import {
  isRoleAlreadyExistsError,
  isRoleNotFoundError,
  PluginConfigurationError,
  TooManyRequestsError,
  UserManagementService
} from '@aws/workbench-core-user-management';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { ForbiddenError } from '../errors/forbiddenError';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError, isGroupNotFoundError } from '../errors/groupNotFoundError';

import { GroupManagementPlugin } from './groupManagementPlugin';
import { AddUserToGroupRequest, AddUserToGroupResponse } from './models/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './models/createGroup';
import { DeleteGroupRequest, DeleteGroupResponse } from './models/deleteGroup';
import { DoesGroupExistRequest, DoesGroupExistResponse } from './models/doesGroupExist';
import { GetGroupMetadataParser } from './models/GetGroupMetadata';
import { GetGroupStatusRequest, GetGroupStatusResponse } from './models/getGroupStatus';
import { GetGroupUsersRequest, GetGroupUsersResponse } from './models/getGroupUsers';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './models/getUserGroups';
import { IsUserAssignedToGroupRequest, IsUserAssignedToGroupResponse } from './models/isUserAssignedToGroup';
import { RemoveUserFromGroupRequest, RemoveUserFromGroupResponse } from './models/removeUserFromGroup';
import { SetGroupMetadata } from './models/SetGroupMetadata';
import { SetGroupStatusRequest, SetGroupStatusResponse } from './models/setGroupStatus';
import {
  ValidateUserGroupsRequest,
  ValidateUserGroupsRequestParser,
  ValidateUserGroupsResponse
} from './models/validateUserGroups';

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
        throw new GroupAlreadyExistsError(error.message);
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

    const projectId = groupId.split('#')[0];
    const role = groupId.split('#')[1];
    const listRequest = ListUsersForRoleRequestParser.parse({ role, projectId });

    try {
      const response = await this._userManagementService.listUsersForRole(listRequest);
      return {
        data: {
          userIds: response.data
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

      const { status } = GetGroupMetadataParser.parse(response.Item);

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
    const key = buildDynamoDBPkSk(groupId, this._userGroupKeyType);
    const item: SetGroupMetadata = {
      id: groupId,
      status: newStatus
    };
    try {
      switch (newStatus) {
        case 'active': {
          const updater = this._ddbService.update({
            key,
            params: {
              item
            }
          });
          updater.condition('attribute_not_exists(pk)');
          await updater.execute();
          break;
        }
        case 'delete_pending': {
          const updater = this._ddbService.update({
            key
          });
          updater
            .condition('attribute_exists(pk) AND ( #status = :oldStatus OR #status = :newStatus )')
            .names({ '#status': 'status' })
            .values({ ':oldStatus': { S: 'active' }, ':newStatus': { S: 'delete_pending' } })
            .set('#status = :newStatus');
          await updater.execute();
          break;
        }
        case 'deleted': {
          const deleter = this._ddbService.delete(key);
          deleter
            .condition('attribute_exists(pk) AND #status = :oldStatus')
            .names({ '#status': 'status' })
            .values({ ':oldStatus': { S: 'delete_pending' } });
          await deleter.execute();
          break;
        }
      }
      return { data: { status: newStatus } };
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new ForbiddenError(
          `Cannot set group '${groupId}' status to ${newStatus}. Incorrect status progression: ${error}`
        );
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'ProvisionedThroughputExceededException' || error.name === 'RequestLimitExceeded') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }
  public async doesGroupExist(request: DoesGroupExistRequest): Promise<DoesGroupExistResponse> {
    const { groupId } = request;
    try {
      const { data } = await this.getGroupStatus({
        groupId
      });
      return {
        data: {
          exist: data.status === 'active'
        }
      };
    } catch (err) {
      if (isGroupNotFoundError(err)) {
        return {
          data: {
            exist: false
          }
        };
      }
      throw err;
    }
  }
  public async validateUserGroups(request: ValidateUserGroupsRequest): Promise<ValidateUserGroupsResponse> {
    const { userId, groupIds } = ValidateUserGroupsRequestParser.parse(request);
    const validGroupIds = await this._userManagementService.validateUserRoles(userId, groupIds);
    return {
      validGroupIds
    };
  }
}
