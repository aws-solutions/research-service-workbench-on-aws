/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryCommandOutput, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AwsService } from '@aws/workbench-core-base';
import _ from 'lodash';
import { Action } from '../action';
import { Effect } from '../permission';
import { DynamicPermissionsPlugin } from './dynamicPermissionsPlugin';
import {
  CreateGroupRequest,
  CreateGroupResponse,
  DeleteGroupRequest,
  DeleteGroupResponse,
  GetUserGroupsRequest,
  GetUserGroupsResponse,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse,
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse,
  AssignUserToGroupRequest,
  AssignUserToGroupResponse,
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse,
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse,
  IdentityPermission,
  IdentityType,
  GetUsersFromGroupRequest,
  GetUsersFromGroupResponse,
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicPermissionsPluginInputs';
import { DynamoDBIdentityPermissionItem } from './dynamoDbIdentityItem';
import { BadConfigurationError } from './errors/badConfigurationError';
import { GroupAlreadyExistsError } from './errors/groupAlreadyExistsError';
import { GroupNotFoundError } from './errors/groupNotFoundError';
import { ThroughPutExceededError } from './errors/throughputExceededError';

/**
 * Request object for DynamoDBDynamicPermissionsPlugin's Init
 */
export interface InitRequest {
  /**
   * Optional groups to create at initialization
   */
  groupsToBeCreated?: { groupIds: string[] };
  /**
   * Optional {@link IdentityPermission}s to be created
   */
  identityPermissionsToBeCreated?: IdentityPermission[];
}
/**
 * Response object for DynamoDBDynamicPermissionsPlugin's Init
 */
export interface InitResponse {
  /**
   * Determines if initialization was successful
   */
  success: boolean;
}

export class DynamoDBDynamicPermissionsPlugin implements DynamicPermissionsPlugin {
  private _awsService: AwsService;
  private _initializationPromise: boolean;
  private _getResourceBySortKeyIndex: string;
  private readonly _groupPrefix: string = 'groupids';

  private readonly _assignedGroupPrefix: string = 'assigned';

  private readonly _identityPermissionsPrefix: string = 'ip';

  public constructor(params: { awsService: AwsService; getResourceBySortKeyIndex: string }) {
    this._awsService = params.awsService;
    this._initializationPromise = false;
    this._getResourceBySortKeyIndex = params.getResourceBySortKeyIndex;
  }

  public async init(initRequest: InitRequest): Promise<InitResponse> {
    try {
      // Check if table is empty
      const response = await this._awsService.helpers.ddb.scan().execute();
      if (response.Count && response.Count > 0) {
        throw new BadConfigurationError('DynamoDB is not empty');
      }
      //Ensure GSI exists
      await this._awsService.helpers.ddb.scan({ index: this._getResourceBySortKeyIndex }).execute();
    } catch (err) {
      if (err.name === 'ResourceNotFoundException') {
        throw new BadConfigurationError('DynamoDB is not configured');
      }
      throw err;
    }
    this._initializationPromise = true;
    const { groupsToBeCreated, identityPermissionsToBeCreated } = initRequest;
    if (groupsToBeCreated) {
      const createGroupPromises = groupsToBeCreated.groupIds.map(async (groupId) => {
        await this.createGroup({ groupId });
      });
      await Promise.all(createGroupPromises);
    }
    if (identityPermissionsToBeCreated) {
      await this.createIdentityPermissions({ identityPermissions: identityPermissionsToBeCreated });
    }
    return { success: true };
  }

  public async createGroup(createGroupRequest: CreateGroupRequest): Promise<CreateGroupResponse> {
    this._isInit();

    const key = {
      pk: this._composeIdentityKey(this._groupPrefix, 'GROUP', createGroupRequest.groupId),
      sk: this._composeIdentityKey(this._groupPrefix, 'GROUP', createGroupRequest.groupId)
    };
    const item = {
      description: createGroupRequest.description
    };

    const condition = 'attribute_not_exists(pk)';
    try {
      await this._awsService.helpers.ddb
        .update(key, {
          item,
          condition
        })
        .execute();
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') {
        throw new GroupAlreadyExistsError('Group already exists');
      }
      throw err;
    }
    return { created: true };
  }

  public async deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    this._isInit();

    // Remove all users from group
    const { groupId } = deleteGroupRequest;
    const { userIds } = await this.getUsersFromGroup({ groupId });
    const removeUsersPromises = _.chunk(userIds, 25).map(async (userIdsChunk) => {
      const deleteKeys = userIdsChunk.map((userId) => {
        return {
          pk: this._composeIdentityKey(this._assignedGroupPrefix, 'USER', userId),
          sk: this._composeIdentityKey(this._assignedGroupPrefix, 'GROUP', groupId)
        };
      });
      await this._awsService.helpers.ddb
        .batchEdit({
          addDeleteRequests: deleteKeys
        })
        .execute();
    });
    await Promise.all(removeUsersPromises);
    //Remove all permissions associated to group
    const { identityPermissions } = await this.getIdentityPermissionsByIdentity({
      identityType: 'GROUP',
      identityId: groupId
    });
    const removeIdentityPermissionsPromises = _.chunk(identityPermissions, 25).map(
      async (identityPermissionsChunk) => {
        const deleteKeys = identityPermissionsChunk.map((identityPermission) => {
          const item = this._createItemFromIdentityPermission(identityPermission);
          return {
            pk: item.pk,
            sk: item.sk
          };
        });
        await this._awsService.helpers.ddb
          .batchEdit({
            addDeleteRequests: deleteKeys
          })
          .execute();
      }
    );
    await Promise.all(removeIdentityPermissionsPromises);
    // Remove group entry
    const groupKey = {
      pk: this._composeIdentityKey(this._groupPrefix, 'GROUP', deleteGroupRequest.groupId),
      sk: this._composeIdentityKey(this._groupPrefix, 'GROUP', deleteGroupRequest.groupId)
    };

    await this._awsService.helpers.ddb.delete(groupKey).execute();
    return { deleted: true };
  }

  public async getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    this._isInit();

    const key = {
      name: 'pk',
      value: this._composeIdentityKey(this._assignedGroupPrefix, 'USER', getUserGroupsRequest.userId)
    };

    const response: QueryCommandOutput = await this._awsService.helpers.ddb
      .query({
        key
      })
      .execute();
    const groupIds: string[] =
      response.Items?.map((item) => {
        const sk = _.get(item as unknown as DynamoDBIdentityPermissionItem, 'sk');
        return this._decomposeKey(sk).id;
      }) ?? [];

    return {
      groupIds
    };
  }

  public async getUsersFromGroup(
    getUsersFromGroup: GetUsersFromGroupRequest
  ): Promise<GetUsersFromGroupResponse> {
    //Requires a GSI where the partitionKey is sk and sort key is pk
    this._isInit();
    const key = {
      name: 'sk',
      value: this._composeIdentityKey(this._assignedGroupPrefix, 'GROUP', getUsersFromGroup.groupId)
    };
    const response = await this._awsService.helpers.ddb
      .query({
        index: this._getResourceBySortKeyIndex,
        key
      })
      .execute();
    const userIds: string[] =
      response.Items?.map((item) => {
        const pk = _.get(item as unknown as DynamoDBIdentityPermissionItem, 'pk');
        return this._decomposeKey(pk).id;
      }) ?? [];

    return {
      userIds
    };
  }

  public async createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    this._isInit();
    const { identityPermissions } = createIdentityPermissionsRequest;

    const unprocessedIdentityPermissions: IdentityPermission[] = [];
    const batchCreateRequestPromises = identityPermissions.map(async (identityPermission) => {
      const condition = 'attribute_not_exists(pk)';
      const item = this._createItemFromIdentityPermission(identityPermission);
      const key = {
        pk: item.pk,
        sk: item.sk
      };
      const params = {
        item,
        condition
      };
      try {
        await this._awsService.helpers.ddb.update(key, params).execute();
      } catch (err) {
        //Track identity permission if unprocesssed
        unprocessedIdentityPermissions.push(identityPermission);
      }
    });

    //Reject
    await Promise.all(batchCreateRequestPromises);
    if (unprocessedIdentityPermissions.length) return { created: false, unprocessedIdentityPermissions };

    return { created: true };
  }

  public async deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    this._isInit();
    const { identityPermissions } = deleteIdentityPermissionsRequest;

    const batchDeleteRequestPromises = _.chunk(identityPermissions, 25).map(async (identityPermissions) => {
      const deleteKeys: { pk: string; sk: string }[] = identityPermissions.map((identityPermission) => {
        const item = this._createItemFromIdentityPermission(identityPermission);
        return {
          pk: item.pk,
          sk: item.sk
        };
      });
      return this._awsService.helpers.ddb
        .batchEdit({
          addDeleteRequests: deleteKeys
        })
        .execute();
    });
    await Promise.all(batchDeleteRequestPromises);

    return { deleted: true };
  }

  public async deleteSubjectPermissions(
    deleteSubjectPermissionsRequest: DeleteSubjectPermissionsRequest
  ): Promise<DeleteSubjectPermissionsResponse> {
    this._isInit();
    const { subjectType, subjectId } = deleteSubjectPermissionsRequest;

    const { identityPermissions } = await this.getIdentityPermissionsBySubject({
      subjectType,
      subjectId
    });
    await this.deleteIdentityPermissions({
      identityPermissions
    });
    return { deleted: true };
  }

  public async assignUserToGroup(
    assignUserToGroupRequest: AssignUserToGroupRequest
  ): Promise<AssignUserToGroupResponse> {
    this._isInit();
    const groupKey = {
      pk: this._composeIdentityKey(this._groupPrefix, 'GROUP', assignUserToGroupRequest.groupId),
      sk: this._composeIdentityKey(this._groupPrefix, 'GROUP', assignUserToGroupRequest.groupId)
    };
    const userGroupKey = {
      pk: this._composeIdentityKey(this._assignedGroupPrefix, 'USER', assignUserToGroupRequest.userId),
      sk: this._composeIdentityKey(this._assignedGroupPrefix, 'GROUP', assignUserToGroupRequest.groupId)
    };

    //Check if group exists
    const response: GetItemCommandOutput = (await this._awsService.helpers.ddb
      .get(groupKey)
      .execute()) as GetItemCommandOutput;
    if (!response || !response.Item) {
      throw new GroupNotFoundError('Group not found');
    }
    //Assign user to group entry
    await this._awsService.helpers.ddb.update(userGroupKey).execute();
    return { assigned: true };
  }

  public async removeUserFromGroup(
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    this._isInit();
    const key = {
      pk: this._composeIdentityKey(this._assignedGroupPrefix, 'USER', removeUserFromGroupRequest.userId),
      sk: this._composeIdentityKey(this._assignedGroupPrefix, 'GROUP', removeUserFromGroupRequest.groupId)
    };
    await this._awsService.helpers.ddb.delete(key).execute();

    return { removed: true };
  }

  public async getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse> {
    this._isInit();
    const key = {
      name: 'pk',
      value: this._composeKey(
        this._identityPermissionsPrefix,
        getIdentityPermissionsBySubjectRequest.subjectType,
        getIdentityPermissionsBySubjectRequest.subjectId
      )
    };

    const query = this._awsService.helpers.ddb.query({
      key
    });

    if (getIdentityPermissionsBySubjectRequest.action) {
      query.filter('#a = :a');
      query.names({ '#a': 'action' });
      query.values(marshall({ ':a': getIdentityPermissionsBySubjectRequest.action }));
    }
    //IN operator maxed out at 100
    if (getIdentityPermissionsBySubjectRequest.identities) {
      if (getIdentityPermissionsBySubjectRequest.identities.length > 100)
        throw new ThroughPutExceededError('Number of identities exceed 100');
      const attributesValues: { [key: string]: string } = {};
      for (let i = 0; i < getIdentityPermissionsBySubjectRequest.identities.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        const { identityType, identityId } = getIdentityPermissionsBySubjectRequest.identities[i];
        _.set(
          attributesValues,
          `:id${i}`,
          this._composeIdentityKey(this._identityPermissionsPrefix, identityType, identityId)
        );
      }
      if (getIdentityPermissionsBySubjectRequest.action) query.filter('AND');
      const idINFilterExp = `#id IN ( ${Object.keys(attributesValues).toString()} )`;
      query.filter(idINFilterExp);
      query.names({ '#id': 'identity' });
      query.values(marshall(attributesValues));
    }

    const response = await query.execute();
    const identityPermissions: IdentityPermission[] =
      response.Items?.map((item) => {
        return this._processItemToIdentityPermission(item as unknown as DynamoDBIdentityPermissionItem);
      }) ?? [];
    return { identityPermissions };
  }

  public async getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse> {
    this._isInit();
    const identityPermissionsGroupKey = {
      name: 'sk',
      value: this._composeIdentityKey(
        this._identityPermissionsPrefix,
        getIdentityPermissionsByIdentityRequest.identityType,
        getIdentityPermissionsByIdentityRequest.identityId
      )
    };
    const identityPermissionsResponse = await this._awsService.helpers.ddb
      .query({
        index: this._getResourceBySortKeyIndex,
        key: identityPermissionsGroupKey
      })
      .execute();

    const identityPermissions: IdentityPermission[] =
      identityPermissionsResponse.Items?.map((item) => {
        return this._processItemToIdentityPermission(item as unknown as DynamoDBIdentityPermissionItem);
      }) ?? [];

    return { identityPermissions };
  }

  private _isInit(): void {
    if (!this._initializationPromise) {
      throw new BadConfigurationError('Not Initialized');
    }
  }

  private _composeIdentityKey(prefix: string, identityType: IdentityType, identityId: string): string {
    return this._composeKey(prefix, identityType, identityId);
  }

  private _composeKey(prefix: string, type: string, id: string): string {
    return `${prefix}#${type}#${id}`;
  }

  private _decomposeKey(key: string): { prefix: string; type: string; id: string } {
    const split = key.split('#');
    return {
      prefix: split[0],
      type: split[1],
      id: split[2]
    };
  }

  private _createItemFromIdentityPermission(
    identityPermission: IdentityPermission
  ): DynamoDBIdentityPermissionItem {
    const action = identityPermission.action as Action;
    const effect = identityPermission.effect as Effect;
    const pk = this._composeKey(
      this._identityPermissionsPrefix,
      identityPermission.subjectType,
      identityPermission.subjectId
    );
    const sk = this._composeIdentityKey(
      this._identityPermissionsPrefix,
      identityPermission.identityType,
      identityPermission.identityId
    );
    // Same as sort key in order to keep identity type and identityid merged
    const identity = sk;

    const conditions = identityPermission.conditions ?? {};
    const fields = identityPermission.fields ?? [];
    return {
      pk,
      sk,
      action,
      effect,
      subjectType: identityPermission.subjectType,
      subjectId: identityPermission.subjectId,
      identity,
      conditions,
      fields
    };
  }

  private _processItemToIdentityPermission(item: DynamoDBIdentityPermissionItem): IdentityPermission {
    const { type, id } = this._decomposeKey(item.identity as string);
    return {
      identityId: id,
      identityType: type as IdentityType,
      action: item.action,
      effect: item.effect,
      subjectType: item.subjectType,
      subjectId: item.subjectId,
      conditions: item.conditions,
      fields: item.fields
    };
  }
}
