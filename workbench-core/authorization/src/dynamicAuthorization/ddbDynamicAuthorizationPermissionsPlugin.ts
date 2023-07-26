/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBService,
  JSONValue,
  addPaginationToken,
  getPaginationToken,
  QueryParams,
  DEFAULT_API_PAGE_SIZE,
  MAX_API_PAGE_SIZE,
  fromPaginationToken
} from '@aws/workbench-core-base';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import _ from 'lodash';
import { createRouter, RadixRouter } from 'radix3';
import { IdentityPermissionCreationError } from '../errors/identityPermissionCreationError';
import { RetryError } from '../errors/retryError';
import { RouteMapError } from '../errors/routeMapError';
import { RouteNotFoundError } from '../errors/routeNotFoundError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { Action } from '../models/action';
import { Effect } from '../models/effect';
import { DynamicRoutesMap, MethodToDynamicOperations, RoutesIgnored } from '../models/routesMap';

import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './models/createIdentityPermissions';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './models/deleteIdentityPermissions';
import {
  DeleteSubjectIdentityPermissionsRequest,
  DeleteSubjectIdentityPermissionsResponse
} from './models/deleteSubjectIdentityPermissions';
import {
  GetDynamicOperationsByRouteRequest,
  GetDynamicOperationsByRouteResponse
} from './models/getDynamicOperationsByRoute';
import {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './models/getIdentityPermissionsByIdentity';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './models/getIdentityPermissionsBySubject';
import { IdentityPermission, IdentityPermissionParser, IdentityType } from './models/identityPermission';
import { IdentityPermissionItem, IdentityPermissionItemParser } from './models/IdentityPermissionItem';
import { IsRouteIgnoredRequest, IsRouteIgnoredResponse } from './models/isRouteIgnored';
import { IsRouteProtectedRequest, IsRouteProtectedResponse } from './models/isRouteProtected';

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
        dynamicOperations,
        pathParams: payload.params
      }
    };
  }
  public async getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse> {
    const { identityId, identityType, limit } = getIdentityPermissionsByIdentityRequest;
    const identity = `${identityType}|${identityId}`;
    let queryParams: QueryParams = {
      limit: Math.min(limit ?? DEFAULT_API_PAGE_SIZE, MAX_API_PAGE_SIZE),
      index: this._getIdentityPermissionsByIdentityIndex,
      key: {
        name: this._getIdentityPermissionsByIdentityPartitionKey,
        value: identity
      }
    };
    if (getIdentityPermissionsByIdentityRequest.paginationToken)
      queryParams = addPaginationToken(getIdentityPermissionsByIdentityRequest.paginationToken, queryParams);
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
    const { subjectId, subjectType, limit } = getIdentityPermissionsBySubjectRequest;
    const key = {
      name: 'pk',
      value: this._createIdentityPermissionsPartitionKey(subjectType, subjectId)
    };

    const query = this._dynamoDBService.query({
      key,
      limit: Math.min(limit ?? DEFAULT_API_PAGE_SIZE, MAX_API_PAGE_SIZE)
    });

    if (getIdentityPermissionsBySubjectRequest.action) {
      query.sortKey('sk').begins({ S: `${getIdentityPermissionsBySubjectRequest.action}` });
    }
    if (getIdentityPermissionsBySubjectRequest.paginationToken)
      query.start(marshall(fromPaginationToken(getIdentityPermissionsBySubjectRequest.paginationToken)));
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

    //Create an item with createIdentityPermissions
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
  public async deleteSubjectIdentityPermissions(
    deleteSubjectIdentityPermissionsRequest: DeleteSubjectIdentityPermissionsRequest
  ): Promise<DeleteSubjectIdentityPermissionsResponse> {
    const { authenticatedUser, subjectType, subjectId } = deleteSubjectIdentityPermissionsRequest;
    const getIdentityPermissionsBySubject = this.getIdentityPermissionsBySubject.bind(this);

    async function* pageThroughResults(
      paginationToken?: string
    ): AsyncGenerator<IdentityPermission[], void, void> {
      const result = await getIdentityPermissionsBySubject({ subjectId, subjectType, paginationToken });

      yield result.data.identityPermissions;

      if (result.paginationToken) {
        yield* pageThroughResults(result.paginationToken);
      }
    }

    const allIdentityPermissions = new Array<IdentityPermission>();

    for await (const page of pageThroughResults()) {
      allIdentityPermissions.push(...page);
    }

    if (allIdentityPermissions.length > 0) {
      for (const identityPermissions of _.chunk(allIdentityPermissions, 100)) {
        await this.deleteIdentityPermissions({
          authenticatedUser,
          identityPermissions
        });
      }
    }

    return {
      data: {
        identityPermissions: allIdentityPermissions
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
  ): IdentityPermissionItem {
    const {
      subjectType,
      subjectId,
      action,
      effect,
      identityType,
      identityId,
      conditions,
      fields,
      description
    } = identityPermission;
    const pk = this._createIdentityPermissionsPartitionKey(subjectType, subjectId);
    const sk = this._createIdentityPermissionsSortKey(action, effect, identityType, identityId);
    const identity = `${identityType}|${identityId}`;

    const item: IdentityPermissionItem = IdentityPermissionItemParser.parse({
      pk,
      sk,
      action,
      effect,
      identity,
      conditions,
      fields,
      description
    });

    return _.omitBy(item, _.isNil) as IdentityPermissionItem;
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
    const identityPermission = IdentityPermissionParser.parse({
      action,
      effect,
      subjectType,
      subjectId,
      identityType,
      identityId,
      conditions,
      fields,
      description
    });

    return _.omitBy(identityPermission, _.isNil) as IdentityPermission;
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
