/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamoDBService, JSONValue, addPaginationToken } from '@aws/workbench-core-base';
import { Action } from '../action';
import { Effect } from '../effect';
import { IdentityPermissionCreationError } from '../errors/identityPermissionCreationError';
import { ThroughputExceededError } from '../errors/throughputExceededError';

import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/createIdentityPermissions';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/deleteIdentityPermissions';
import {
  GetDynamicOperationsByRouteRequest,
  GetDynamicOperationsByRouteResponse
} from './dynamicAuthorizationInputs/getDynamicOperationsByRoute';
import {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsByIdentity';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsBySubject';
import { IdentityPermission, IdentityType } from './dynamicAuthorizationInputs/identityPermission';
import { IsRouteIgnoredRequest, IsRouteIgnoredResponse } from './dynamicAuthorizationInputs/isRouteIgnored';
import {
  IsRouteProtectedRequest,
  IsRouteProtectedResponse
} from './dynamicAuthorizationInputs/isRouteProtected';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';

export class DDBDynamicAuthorizationPermissionsPlugin implements DynamicAuthorizationPermissionsPlugin {
  private readonly _getIdentityPermissionsByIdentityIndex: string = 'getIdentityPermissionsByIdentity';
  private readonly _getIdentityPermissionsByIdentityPartitionKey: string = 'identity';
  private readonly _delimiter: string = '|';
  private _dynamoDBService: DynamoDBService;

  public constructor(config: { dynamoDBService: DynamoDBService }) {
    this._dynamoDBService = config.dynamoDBService;
  }

  public async isRouteIgnored(isRouteIgnoredRequest: IsRouteIgnoredRequest): Promise<IsRouteIgnoredResponse> {
    throw new Error('Method not implemented.');
  }
  public async isRouteProtected(
    isRouteProtectedRequest: IsRouteProtectedRequest
  ): Promise<IsRouteProtectedResponse> {
    throw new Error('Method not implemented.');
  }
  public async getDynamicOperationsByRoute(
    getDynamicOperationsByRouteRequest: GetDynamicOperationsByRouteRequest
  ): Promise<GetDynamicOperationsByRouteResponse> {
    throw new Error('Method not implemented.');
  }
  public async getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse> {
    const { identityId, identityType } = getIdentityPermissionsByIdentityRequest;
    const identity = `${identityType}|${identityId}`;
    const queryParams = {
      index: this._getIdentityPermissionsByIdentityIndex,
      key: {
        name: this._getIdentityPermissionsByIdentityPartitionKey,
        value: identity
      }
    };
    if (getIdentityPermissionsByIdentityRequest.paginationToken)
      addPaginationToken(getIdentityPermissionsByIdentityRequest.paginationToken, queryParams);
    const { data, paginationToken } = await this._dynamoDBService.getPaginatedItems(queryParams);

    const identityPermissions = data.map((item) => this._transformItemToIdentityPermission(item));
    return {
      data: {
        identityPermissions
      },
      paginationToken
    };
  }
  public async getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse> {
    throw new Error('Method not implemented.');
  }
  public async createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    const { identityPermissions } = createIdentityPermissionsRequest;
    //Check if there are 100 ops
    if (identityPermissions.length > 100)
      throw new ThroughputExceededError('Exceeds 100 identity permissions');

    //Create an item with createIdenttiyPermissions
    const putRequests = identityPermissions.map((identityPermission) => {
      const item = this._transformIdentityPermissionsToItem(identityPermission);
      const conditionExpression = 'attribute_not_exists(pk)';
      return {
        item,
        conditionExpression
      };
    });

    // Will fail entire transaction if a single one fails
    try {
      await this._dynamoDBService.commitTransaction({
        addPutRequests: putRequests
      });
    } catch (err) {
      if (err.name === 'TransactionCanceledException') {
        throw new IdentityPermissionCreationError(`Failed due to an exception: ${err.message}`);
      }
      throw err;
    }

    return {
      data: {
        identityPermissions
      }
    };
  }
  public async deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  /**
   * @param identityPermission - {@link IdentityPermission} to be transformed
   *
   * Transforms data into this form
   * ```
   * {
   *  "*pk*" : "<subjectType>|<subject_id>" // partition key
   *  "*sk*": " <CRUD Action> | <effect> | <IdentityType>|<IdentityId>" // sort key
   *  "identity": "<IdentityType>|<IdentityId>"
   *  "effect": "ALLOW | DENY"
   *  "action" : "<CRUD Action>"
   *  "conditions": {}
   *  "fields": []
   *  "description": "Description of identity"
   * }
   * ```
   * @returns
   */
  private _transformIdentityPermissionsToItem(
    identityPermission: IdentityPermission
  ): Record<string, JSONValue> {
    const { subjectType, subjectId, action, effect, identityType, identityId } = identityPermission;
    const pk = this._createIdentityPermissionsPartitionKey(subjectType, subjectId);
    const sk = this._createIdentityPermissionsSortKey(action, effect, identityType, identityId);
    const identity = `${identityType}|${identityId}`;
    const conditions = identityPermission.conditions ?? {};
    const fields = identityPermission.fields ?? [];
    const description = identityPermission.description ?? '';

    const item: Record<string, JSONValue> = {
      pk,
      sk,
      action,
      effect,
      identity,
      conditions,
      fields,
      description
    };
    return item;
  }

  private _createIdentityPermissionsPartitionKey(subjectType: string, subjectId: string): string {
    return `${subjectType}|${subjectId}`;
  }

  private _createIdentityPermissionsSortKey(
    action: Action,
    effect: Effect,
    identityType: IdentityType,
    identityId: string
  ): string {
    return `${action}${this._delimiter}${effect}${this._delimiter}${identityType}${this._delimiter}${identityId}`;
  }
  private _transformItemToIdentityPermission(item: Record<string, JSONValue>): IdentityPermission {
    const { pk, sk, conditions, fields, description } = item;
    const { subjectType, subjectId } = this._decomposeIdentityPermissionsPartitionKey(pk as string);
    const { action, effect, identityType, identityId } = this._decomposeIdentityPermissionsSortKey(
      sk as string
    );

    return {
      action,
      effect,
      subjectType,
      subjectId,
      identityType,
      identityId,
      conditions: conditions as Record<string, JSONValue>,
      fields: fields as string[],
      description: description as string
    };
  }

  private _decomposeIdentityPermissionsPartitionKey(partitionKey: string): {
    subjectType: string;
    subjectId: string;
  } {
    const values = partitionKey.split(this._delimiter);
    return {
      subjectType: values[0],
      subjectId: values[1]
    };
  }

  private _decomposeIdentityPermissionsSortKey(sortKey: string): {
    action: Action;
    effect: Effect;
    identityType: IdentityType;
    identityId: string;
  } {
    const values = sortKey.split(this._delimiter);
    return {
      action: values[0] as Action,
      effect: values[1] as Effect,
      identityType: values[2] as IdentityType,
      identityId: values[3]
    };
  }
}
