/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { DynamoDBService, JSONValue, addPaginationToken, getPaginationToken } from '@aws/workbench-core-base';
import _ from 'lodash';
import { createRouter, RadixRouter } from 'radix3';
import { Action } from '../action';
import { Effect } from '../effect';
import { IdentityPermissionCreationError } from '../errors/identityPermissionCreationError';
import { RetryError } from '../errors/retryError';
import { RouteMapError } from '../errors/routeMapError';
import { RouteNotFoundError } from '../errors/routeNotFoundError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { DynamicRoutesMap, MethodToDynamicOperations, RoutesIgnored } from '../routesMap';

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
  private _protectedRoutes: RadixRouter;
  private _ignoredRoutes: RadixRouter;

  public constructor(config: {
    dynamoDBService: DynamoDBService;
    dynamicRoutesMap?: DynamicRoutesMap;
    routesIgnored?: RoutesIgnored;
  }) {
    this._dynamoDBService = config.dynamoDBService;
    this._protectedRoutes = createRouter();
    this._ignoredRoutes = createRouter();

    const routesSet = new Set();

    if (config.routesIgnored) {
      for (const [route, httpMethods] of Object.entries(config.routesIgnored)) {
        this._ignoredRoutes.insert(route, { httpMethods });
        Object.keys(httpMethods).forEach((method) => {
          routesSet.add(`${method}:${route}`);
        });
      }
    }

    if (config.dynamicRoutesMap) {
      for (const [route, methodToDynamicOperations] of Object.entries(config.dynamicRoutesMap)) {
        this._protectedRoutes.insert(route, { methodToDynamicOperations });
        Object.keys(methodToDynamicOperations).forEach((method) => {
          if (routesSet.has(`${method}:${route}`))
            throw new RouteMapError(`${method}:${route} was already ignored`);
        });
      }
    }
  }

  public async isRouteIgnored(isRouteIgnoredRequest: IsRouteIgnoredRequest): Promise<IsRouteIgnoredResponse> {
    const { route, method } = isRouteIgnoredRequest;
    const payload = this._ignoredRoutes.lookup(route) ?? {};
    const httpMethods = _.get(payload, 'httpMethods', {});
    return {
      data: {
        routeIgnored: _.get(httpMethods, method, false)
      }
    };
  }
  public async isRouteProtected(
    isRouteProtectedRequest: IsRouteProtectedRequest
  ): Promise<IsRouteProtectedResponse> {
    const { route, method } = isRouteProtectedRequest;
    const payload = this._protectedRoutes.lookup(route) ?? {};
    const methodToDynamicOperations: MethodToDynamicOperations = _.get(
      payload,
      'methodToDynamicOperations',
      {}
    );
    return {
      data: {
        routeProtected: _.get(methodToDynamicOperations, method, undefined) ? true : false
      }
    };
  }
  public async getDynamicOperationsByRoute(
    getDynamicOperationsByRouteRequest: GetDynamicOperationsByRouteRequest
  ): Promise<GetDynamicOperationsByRouteResponse> {
    const { route, method } = getDynamicOperationsByRouteRequest;
    const payload = this._protectedRoutes.lookup(route);
    if (!payload) throw new RouteNotFoundError();
    const methodToDynamicOperations: MethodToDynamicOperations = _.get(
      payload,
      'methodToDynamicOperations',
      {}
    );
    const dynamicOperations = _.get(methodToDynamicOperations, method, undefined);
    if (!dynamicOperations) throw new RouteNotFoundError();
    return {
      data: {
        dynamicOperations
      }
    };
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
    const { subjectId, subjectType } = getIdentityPermissionsBySubjectRequest;
    const key = {
      name: 'pk',
      value: this._createIdentityPermissionsPartitionKey(subjectType, subjectId)
    };

    const query = this._dynamoDBService.query({
      key
    });

    if (getIdentityPermissionsBySubjectRequest.action) {
      query.sortKey('sk').begins({ S: `${getIdentityPermissionsBySubjectRequest.action}` });
    }

    //IN operator maxed out at 100
    if (getIdentityPermissionsBySubjectRequest.identities) {
      const { identities } = getIdentityPermissionsBySubjectRequest;
      if (identities.length > 100) throw new ThroughputExceededError('Number of identities exceed 100');
      const attributesValues: Record<string, AttributeValue> = {};
      for (let i = 0; i < identities.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        const { identityType, identityId } = identities[i];
        _.set(attributesValues, `:id${i}`, {
          S: `${identityType}|${identityId}`
        });
      }
      const idINFilterExp = `#id IN ( ${Object.keys(attributesValues).toString()} )`;
      query.filter(idINFilterExp);
      query.names({ '#id': 'identity' });
      query.values(attributesValues);
    }

    const response = await query.execute();
    const items = response.Items ?? [];
    const identityPermissions: IdentityPermission[] = items.map((item) => {
      return this._transformItemToIdentityPermission(item as unknown as Record<string, JSONValue>);
    });

    return {
      data: {
        identityPermissions
      },
      paginationToken: getPaginationToken(response)
    };
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
    const { identityPermissions } = deleteIdentityPermissionsRequest;
    if (identityPermissions.length > 100)
      throw new ThroughputExceededError('Can not perform over 100 deletions');

    const keys = identityPermissions.map((identityPermission) => {
      const { subjectType, subjectId, action, effect, identityType, identityId } = identityPermission;
      const pk = this._createIdentityPermissionsPartitionKey(subjectType, subjectId);
      const sk = this._createIdentityPermissionsSortKey(action, effect, identityType, identityId);
      return {
        pk,
        sk
      };
    });
    //transact delete items, should be fine if one or more fail, throw a retry error
    try {
      await this._dynamoDBService.commitTransaction({
        addDeleteRequests: keys
      });
    } catch (err) {
      if (err.name === 'TransactionCanceledException') throw new RetryError();
      throw err;
    }
    return {
      data: {
        identityPermissions: deleteIdentityPermissionsRequest.identityPermissions
      }
    };
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
   *  "fields": ["<fieldValue>"]
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
    const conditions = identityPermission.conditions;
    const fields = identityPermission.fields;
    const description = identityPermission.description;

    const itemWithUndefined: Record<string, JSONValue | undefined> = {
      pk,
      sk,
      action,
      effect,
      identity,
      conditions,
      fields,
      description
    };
    const item: Record<string, JSONValue> = _.omitBy(itemWithUndefined, _.isNil) as Record<string, JSONValue>;
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
    return [action, effect, identityType, identityId].join(this._delimiter);
  }
  private _transformItemToIdentityPermission(item: Record<string, JSONValue>): IdentityPermission {
    const { pk, sk, conditions, fields, description } = item;
    const { subjectType, subjectId } = this._decomposeIdentityPermissionsPartitionKey(pk as string);
    const { action, effect, identityType, identityId } = this._decomposeIdentityPermissionsSortKey(
      sk as string
    );
    let identityPermission: IdentityPermission = {
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
    identityPermission = _.omitBy(identityPermission, _.isNil) as IdentityPermission;
    return identityPermission;
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
