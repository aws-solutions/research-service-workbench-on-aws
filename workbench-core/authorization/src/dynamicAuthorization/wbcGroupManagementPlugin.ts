/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { buildDynamoDBPkSk } from '@aws/workbench-core-base/lib';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import {
  isRoleAlreadyExistsError,
  PluginConfigurationError,
  UserManagementService
} from '@aws/workbench-core-user-management';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { TooManyRequestsError } from '../errors/tooManyRequestsError';

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
      await this._userManagementService.createRole(groupId);
      return { data: { groupId } };
    } catch (error) {
      if (isRoleAlreadyExistsError(error)) {
        throw new GroupAlreadyExistsError(error.message);
      }
      throw error;
    }
  }
  public deleteGroup(request: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    throw new Error('Method not implemented.');
  }
  public getUserGroups(request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    throw new Error('Method not implemented.');
  }
  public getGroupUsers(request: GetGroupUsersRequest): Promise<GetGroupUsersResponse> {
    throw new Error('Method not implemented.');
  }
  public async addUserToGroup(request: AddUserToGroupRequest): Promise<AddUserToGroupResponse> {
    const { groupId, userId } = request;

    // ToDo: This requires a check to ensure status of group isn't in pending_delete
    // ToDo: Will also require an audit trail after #725 is merged
    // ToDo: Audit authenticatedUser which actor is performing operation

    try {
      await this._userManagementService.addUserToRole(userId, groupId);
      return { data: { userId, groupId } };
    } catch (error) {
      if (error.name === 'RoleNotFoundError') {
        throw new GroupNotFoundError(error.message);
      }

      throw error;
    }
  }
  public isUserAssignedToGroup(
    request: IsUserAssignedToGroupRequest
  ): Promise<IsUserAssignedToGroupResponse> {
    throw new Error('Method not implemented.');
  }
  public removeUserFromGroup(request: RemoveUserFromGroupRequest): Promise<RemoveUserFromGroupResponse> {
    throw new Error('Method not implemented.');
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
    const { groupId, status } = request;

    const item: GroupMetadata = {
      id: groupId,
      status
    };

    try {
      await this._ddbService
        .update({
          key: buildDynamoDBPkSk(groupId, this._userGroupKeyType),
          params: {
            item
          }
        })
        .execute();

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
}
