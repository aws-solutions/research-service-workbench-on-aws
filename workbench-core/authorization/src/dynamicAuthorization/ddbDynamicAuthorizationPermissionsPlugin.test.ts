/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, DEFAULT_API_PAGE_SIZE, JSONValue, MAX_API_PAGE_SIZE } from '@aws/workbench-core-base';
import {
  DynamoDBClient,
  ServiceInputTypes,
  ServiceOutputTypes,
  TransactWriteItemsCommand,
  TransactionCanceledException,
  QueryCommand,
  AttributeValue
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient, AwsStub } from 'aws-sdk-client-mock';
import { fc, itProp } from 'jest-fast-check';
import _ from 'lodash';
import { IdentityPermissionCreationError } from '../errors/identityPermissionCreationError';
import { RetryError } from '../errors/retryError';
import { RouteMapError } from '../errors/routeMapError';
import { RouteNotFoundError } from '../errors/routeNotFoundError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { Action } from '../models/action';
import { AuthenticatedUser } from '../models/authenticatedUser';
import { Effect } from '../models/effect';
import { DynamicRoutesMap, MethodToDynamicOperations, RoutesIgnored } from '../models/routesMap';
import { DDBDynamicAuthorizationPermissionsPlugin } from './ddbDynamicAuthorizationPermissionsPlugin';
import { DynamicOperation } from './models/dynamicOperation';
import { IdentityPermission, IdentityType } from './models/identityPermission';

describe('DDB Dynamic Authorization Permissions Plugin tests', () => {
  let region: string;
  let ddbTableName: string;
  let mockAuthenticatedUser: AuthenticatedUser;

  let dynamoDBDynamicPermissionsPlugin: DDBDynamicAuthorizationPermissionsPlugin;
  let awsService: AwsService;
  let mockDDB: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  let sampleGroupId: string;
  let sampleGroupType: IdentityType;

  let sampleAction: Action;
  let sampleEffect: Effect;
  let sampleSubjectType: string;
  let sampleSubjectId: string;
  let sampleConditions: Record<string, JSONValue>;
  let sampleFields: string[];
  let sampleDescription: string;

  let mockIdentityPermission: IdentityPermission;
  let mockIdentityPermissionItem: Record<string, AttributeValue>;
  let samplePartitionKey: string;
  let sampleSortKey: string;
  let sampleGroupIdentity: string;

  let base64PaginationToken: string;

  let dynamicRoutesMap: DynamicRoutesMap;
  let sampleStaticRouteName: string;
  let sampleStaticRouteMap: MethodToDynamicOperations;
  let sampleStaticRouteGet: DynamicOperation[];

  let sampleDynamicRouteName: string;
  let sampleDynamicRouteMap: MethodToDynamicOperations;
  let sampleDynamicRouteDelete: DynamicOperation[];

  let getStaticRouteIgnoredName: string;

  let getDynamicRouteIgnoredName: string;

  let routesIgnored: RoutesIgnored;

  beforeEach(() => {
    expect.hasAssertions();
    jest.resetModules(); // Most important - it clears the cache

    ddbTableName = 'PermissionsTable';
    region = 'us-east-1';
    mockAuthenticatedUser = {
      id: 'sampleUserId',
      roles: []
    };
    sampleStaticRouteName = '/simple/route';
    sampleStaticRouteGet = [
      {
        action: 'CREATE',
        subject: {
          subjectId: 'sampleSubjectId',
          subjectType: 'sampleSubjectType'
        }
      }
    ];
    sampleStaticRouteMap = {
      GET: sampleStaticRouteGet
    };

    sampleDynamicRouteName = '/dynamic/:type/:id';
    sampleDynamicRouteDelete = [
      {
        action: 'DELETE',
        subject: {
          subjectId: 'sampleSubjectId',
          subjectType: 'sampleSubjectType'
        }
      }
    ];
    sampleDynamicRouteMap = {
      DELETE: sampleDynamicRouteDelete
    };
    dynamicRoutesMap = {};
    dynamicRoutesMap[`${sampleStaticRouteName}`] = sampleStaticRouteMap;
    dynamicRoutesMap[`${sampleDynamicRouteName}`] = sampleDynamicRouteMap;

    getStaticRouteIgnoredName = 'path/ignored';

    getDynamicRouteIgnoredName = 'path/ignored/:name';

    routesIgnored = {};
    routesIgnored[`${getStaticRouteIgnoredName}`] = {
      GET: true
    };
    routesIgnored[`${getDynamicRouteIgnoredName}`] = {
      GET: true
    };

    awsService = new AwsService({ region, ddbTableName });
    dynamoDBDynamicPermissionsPlugin = new DDBDynamicAuthorizationPermissionsPlugin({
      dynamoDBService: awsService.helpers.ddb,
      dynamicRoutesMap,
      routesIgnored
    });

    mockDDB = mockClient(DynamoDBClient);

    sampleGroupId = 'sampleGroup';
    sampleGroupType = 'GROUP';
    sampleAction = 'CREATE';
    sampleEffect = 'ALLOW';
    sampleSubjectType = 'sampleSubjectType';
    sampleSubjectId = 'sampleSubjectId';
    sampleConditions = {};
    sampleFields = ['sampleField'];
    sampleDescription = 'sampleDescription';
    mockIdentityPermission = {
      action: sampleAction,
      effect: sampleEffect,
      subjectType: sampleSubjectType,
      subjectId: sampleSubjectId,
      identityId: sampleGroupId,
      identityType: sampleGroupType,
      conditions: sampleConditions,
      fields: sampleFields,
      description: sampleDescription
    };

    samplePartitionKey = `${sampleSubjectType}|${sampleSubjectId}`;
    sampleSortKey = `${sampleAction}|${sampleEffect}|${sampleGroupType}|${sampleGroupId}`;
    sampleGroupIdentity = `${sampleGroupType}|${sampleGroupId}`;
    mockIdentityPermissionItem = {
      pk: { S: samplePartitionKey },
      sk: { S: sampleSortKey },
      action: { S: sampleAction },
      effect: { S: sampleEffect },
      subjectType: { S: sampleSubjectType },
      subjectId: { S: sampleSubjectId },
      identity: { S: sampleGroupIdentity },
      conditions: { M: marshall(sampleConditions) },
      fields: { L: [{ S: 'sampleField' }] },
      description: { S: sampleDescription }
    };
    base64PaginationToken = 'eyJwayI6InNhbXBsZVN1YmplY3RUeXBlfHNhbXBsZVN1YmplY3RJZCJ9';
  });

  describe('constructor', () => {
    test('can not define protection and ignore for the same route + method', async () => {
      const dynamicRoutesMap: DynamicRoutesMap = {
        '/sampleRoute': {
          GET: []
        }
      };

      const routesIgnored: RoutesIgnored = {
        '/sampleRoute': {
          GET: true
        }
      };
      try {
        new DDBDynamicAuthorizationPermissionsPlugin({
          dynamoDBService: awsService.helpers.ddb,
          dynamicRoutesMap,
          routesIgnored
        });
      } catch (err) {
        expect(err).toBeInstanceOf(RouteMapError);
      }
    });
  });

  describe('isRouteIgnored', () => {
    test(`${getStaticRouteIgnoredName} should be ignored on GET`, async () => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.isRouteIgnored({
        route: getStaticRouteIgnoredName,
        method: 'GET'
      });
      expect(data.routeIgnored).toBeTruthy();
    });

    test(`${getDynamicRouteIgnoredName} should be ignored on GET`, async () => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.isRouteIgnored({
        route: 'path/ignored/testname',
        method: 'GET'
      });
      expect(data.routeIgnored).toBeTruthy();
    });
    //Test operation on random string
    test(`${getDynamicRouteIgnoredName} should be ignored on DELETE`, async () => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.isRouteIgnored({
        route: 'path/ignored/testname',
        method: 'GET'
      });
      expect(data.routeIgnored).toBeTruthy();
    });

    itProp('random path input should not be ignored on GET', [fc.string()], async (route) => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.isRouteIgnored({
        route,
        method: 'GET'
      });
      expect(data.routeIgnored).toBeFalsy();
    });
  });

  describe('isRouteProtected', () => {
    test(`${sampleStaticRouteName} should be protected on GET`, async () => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.isRouteProtected({
        route: sampleStaticRouteName,
        method: 'GET'
      });
      expect(data.routeProtected).toBeTruthy();
    });

    test(`${sampleDynamicRouteName} should be protected on GET`, async () => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.isRouteProtected({
        route: '/dynamic/sampleSubjectType/sampleSubjectId',
        method: 'DELETE'
      });
      expect(data.routeProtected).toBeTruthy();
    });

    itProp('random path input should not be protected on GET', [fc.string()], async (route) => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.isRouteProtected({
        route,
        method: 'GET'
      });
      expect(data.routeProtected).toBeFalsy();
    });
  });

  describe('getDynamicOperationsByRoute', () => {
    test(`get operations by route ${sampleStaticRouteName}`, async () => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.getDynamicOperationsByRoute({
        route: sampleStaticRouteName,
        method: 'GET'
      });
      expect(data.dynamicOperations).toStrictEqual(sampleStaticRouteGet);
    });

    test(`get operations by route ${sampleDynamicRouteName}`, async () => {
      const { data } = await dynamoDBDynamicPermissionsPlugin.getDynamicOperationsByRoute({
        route: '/dynamic/sampleSubjectType/sampleSubjectId',
        method: 'DELETE'
      });
      expect(data.dynamicOperations).toStrictEqual(sampleDynamicRouteDelete);
      expect(data.pathParams).toStrictEqual({
        id: sampleSubjectId,
        type: sampleSubjectType
      });
    });

    itProp(
      `get operations by route with an invalid route should throw RouteNotFoundError`,
      [fc.string()],
      async (route) => {
        await expect(
          dynamoDBDynamicPermissionsPlugin.getDynamicOperationsByRoute({
            route,
            method: 'DELETE'
          })
        ).rejects.toThrow(RouteNotFoundError);
      }
    );

    itProp(
      `get operations by route with a valid route but invalid method should throw RouteNotFoundError`,
      [fc.string()],
      async (route) => {
        await expect(
          dynamoDBDynamicPermissionsPlugin.getDynamicOperationsByRoute({
            route: '/dynamic/sampleSubjectType/sampleSubjectId',
            method: 'GET'
          })
        ).rejects.toThrow(RouteNotFoundError);
      }
    );
  });

  describe('getIdentityPermissionsBySubject', () => {
    test('Get identity permissions by subject, filter on action and groupId', async () => {
      const keyConditionExpression = '#pk = :pk AND begins_with ( #sk, :sk )';
      const filterExpression = '#id IN ( :id0 )';
      const attributeNames = { '#pk': 'pk', '#sk': 'sk', '#id': 'identity' };
      const attributeValues = {
        ':pk': { S: `${sampleSubjectType}|${sampleSubjectId}` },
        ':sk': { S: sampleAction },
        ':id0': { S: sampleGroupIdentity }
      };
      mockDDB
        .on(QueryCommand, {
          FilterExpression: filterExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          KeyConditionExpression: keyConditionExpression,
          Limit: DEFAULT_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem]
        });

      const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType,
        action: sampleAction,
        identities: [{ identityId: sampleGroupId, identityType: sampleGroupType }]
      });
      expect(response.data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });

    test('Get identity permissions by subject, filter on action', async () => {
      const keyConditionExpression = '#pk = :pk AND begins_with ( #sk, :sk )';
      const attributeNames = { '#pk': 'pk', '#sk': 'sk' };
      const attributeValues = {
        ':pk': { S: `${sampleSubjectType}|${sampleSubjectId}` },
        ':sk': { S: sampleAction }
      };
      mockDDB
        .on(QueryCommand, {
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          KeyConditionExpression: keyConditionExpression,
          Limit: DEFAULT_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem]
        });

      const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType,
        action: sampleAction
      });
      expect(response.data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });

    test('Get identity permissions by subject, filter on groupId', async () => {
      const keyConditionExpression = '#pk = :pk';
      const filterExpression = '#id IN ( :id0 )';
      const attributeNames = { '#pk': 'pk', '#id': 'identity' };
      const attributeValues = {
        ':pk': { S: `${sampleSubjectType}|${sampleSubjectId}` },
        ':id0': { S: sampleGroupIdentity }
      };
      mockDDB
        .on(QueryCommand, {
          FilterExpression: filterExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          KeyConditionExpression: keyConditionExpression,
          Limit: DEFAULT_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem]
        });

      const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType,
        identities: [{ identityId: sampleGroupId, identityType: sampleGroupType }]
      });
      expect(response.data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });

    test('Get identity permissions by subject with pagination token', async () => {
      const keyConditionExpression = '#pk = :pk';
      const filterExpression = '#id IN ( :id0 )';
      const attributeNames = { '#pk': 'pk', '#id': 'identity' };
      const attributeValues = {
        ':pk': { S: `${sampleSubjectType}|${sampleSubjectId}` },
        ':id0': { S: sampleGroupIdentity }
      };
      mockDDB
        .on(QueryCommand, {
          FilterExpression: filterExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          KeyConditionExpression: keyConditionExpression,
          Limit: DEFAULT_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem],
          LastEvaluatedKey: { pk: { S: samplePartitionKey } }
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem]
        });
      const { data, paginationToken } =
        await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
          subjectId: sampleSubjectId,
          subjectType: sampleSubjectType,
          identities: [{ identityId: sampleGroupId, identityType: sampleGroupType }]
        });
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(paginationToken).toStrictEqual(base64PaginationToken);

      const nextResponse = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType,
        identities: [{ identityId: sampleGroupId, identityType: sampleGroupType }],
        paginationToken
      });
      expect(nextResponse.data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(nextResponse.paginationToken).toBeUndefined();
    });

    test('Get identity permissions by subject with limit on number of identity permissions returned', async () => {
      const keyConditionExpression = '#pk = :pk';
      const filterExpression = '#id IN ( :id0 )';
      const attributeNames = { '#pk': 'pk', '#id': 'identity' };
      const attributeValues = {
        ':pk': { S: `${sampleSubjectType}|${sampleSubjectId}` },
        ':id0': { S: sampleGroupIdentity }
      };
      const limit = 1;
      mockDDB
        .on(QueryCommand, {
          FilterExpression: filterExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          KeyConditionExpression: keyConditionExpression,
          Limit: limit
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem],
          LastEvaluatedKey: { pk: { S: samplePartitionKey } }
        });
      const { data, paginationToken } =
        await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
          subjectId: sampleSubjectId,
          subjectType: sampleSubjectType,
          identities: [{ identityId: sampleGroupId, identityType: sampleGroupType }],
          limit
        });
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(paginationToken).toStrictEqual(base64PaginationToken);
    });

    test('Get identity permissions by subject default to MAX_API_PAGE_SIZE if limit exceeds it', async () => {
      const keyConditionExpression = '#pk = :pk';
      const filterExpression = '#id IN ( :id0 )';
      const attributeNames = { '#pk': 'pk', '#id': 'identity' };
      const attributeValues = {
        ':pk': { S: `${sampleSubjectType}|${sampleSubjectId}` },
        ':id0': { S: sampleGroupIdentity }
      };
      const limit = MAX_API_PAGE_SIZE + 1;
      mockDDB
        .on(QueryCommand, {
          FilterExpression: filterExpression,
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: attributeValues,
          KeyConditionExpression: keyConditionExpression,
          Limit: MAX_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem],
          LastEvaluatedKey: { pk: { S: samplePartitionKey } }
        });
      const { data, paginationToken } =
        await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
          subjectId: sampleSubjectId,
          subjectType: sampleSubjectType,
          identities: [{ identityId: sampleGroupId, identityType: sampleGroupType }],
          limit
        });
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(paginationToken).toStrictEqual(base64PaginationToken);
    });

    test('Exceed identity limitation, throw ThroughputExceededError', async () => {
      const exceededIdentities = Array(101).fill({
        identityId: sampleGroupId,
        identityType: sampleGroupType
      });
      await expect(
        dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
          subjectId: sampleSubjectId,
          subjectType: sampleSubjectType,
          identities: exceededIdentities
        })
      ).rejects.toThrow(ThroughputExceededError);
    });
    test('Get identity permissions by subject, no items returned', async () => {
      mockDDB.on(QueryCommand).resolvesOnce({});

      const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType,
        identities: [{ identityId: sampleGroupId, identityType: sampleGroupType }]
      });
      expect(response.data.identityPermissions).toStrictEqual([]);
    });
  });

  describe('createIdentityPermissions tests', () => {
    let failedIdentityPermission: IdentityPermission;
    beforeAll(() => {
      failedIdentityPermission = {
        action: sampleAction,
        effect: sampleEffect,
        subjectType: sampleSubjectType,
        subjectId: sampleSubjectId,
        identityId: sampleGroupId,
        identityType: sampleGroupType,
        conditions: sampleConditions,
        fields: sampleFields
      };
    });
    test('Create identity permissions', async () => {
      const mockIdentityPermissions: IdentityPermission[] = [mockIdentityPermission];
      mockDDB.on(TransactWriteItemsCommand).resolvesOnce({});

      const response = await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
        identityPermissions: mockIdentityPermissions,
        authenticatedUser: mockAuthenticatedUser
      });
      expect(response.data.identityPermissions).toBe(mockIdentityPermissions);
    });
    test('Create identity permissions, with no conditions, fields, and descriptions', async () => {
      const mockIdentityPermissions: IdentityPermission[] = [
        _.omit(mockIdentityPermission, ['fields', 'conditions', 'description'])
      ];
      mockDDB.on(TransactWriteItemsCommand).resolvesOnce({});

      const response = await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
        identityPermissions: mockIdentityPermissions,
        authenticatedUser: mockAuthenticatedUser
      });
      expect(response.data.identityPermissions).toBe(mockIdentityPermissions);
    });
    test('Create identity permissions with one failed should throw IdentityPermissionCreationError', async () => {
      const mockTransactionCanceledException = new TransactionCanceledException({
        message:
          'Transaction cancelled, please refer cancellation reasons for specific reasons [ConditionalCheckFailed]',
        $metadata: {}
      });
      const mockIdentityPermissions: IdentityPermission[] = [
        mockIdentityPermission,
        failedIdentityPermission
      ];
      mockDDB.on(TransactWriteItemsCommand).rejects(mockTransactionCanceledException);

      await expect(
        dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
          identityPermissions: mockIdentityPermissions,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(IdentityPermissionCreationError);
    });

    test('Create identity permissions that exceeds 100 identity permissions should throw ThroughputExceededError', async () => {
      const identityPermissions = Array(101).fill(mockIdentityPermission);
      await expect(
        dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
          identityPermissions,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(ThroughputExceededError);
    });

    test('Create identity permissions with unknown error thrown', async () => {
      mockDDB.on(TransactWriteItemsCommand).rejects(new Error('Random error should be caught'));
      await expect(
        dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
          identityPermissions: [mockIdentityPermission],
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(Error);
    });
  });

  describe('getIdentityPermissionsByIdentity', () => {
    test('Get identity permissions by identity', async () => {
      mockDDB
        .on(QueryCommand, {
          IndexName: 'getIdentityPermissionsByIdentity',
          Limit: DEFAULT_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem]
        });
      const { data } = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
        identityId: sampleGroupId,
        identityType: sampleGroupType
      });

      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });

    test('Get identity permissions by identity with zero permissions', async () => {
      mockDDB
        .on(QueryCommand, {
          IndexName: 'getIdentityPermissionsByIdentity',
          Limit: DEFAULT_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: []
        });
      const { data } = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
        identityId: sampleGroupId,
        identityType: sampleGroupType
      });

      expect(data.identityPermissions).toStrictEqual([]);
    });

    test('Get identity permissions by identity with pagination token', async () => {
      mockDDB
        .on(QueryCommand, {
          IndexName: 'getIdentityPermissionsByIdentity',
          Limit: DEFAULT_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem],
          LastEvaluatedKey: { pk: { S: samplePartitionKey } }
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem]
        });

      const { data, paginationToken } =
        await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
          identityId: sampleGroupId,
          identityType: sampleGroupType
        });
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(paginationToken).toStrictEqual(base64PaginationToken);
      const nextResponse = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
        identityId: sampleGroupId,
        identityType: sampleGroupType,
        paginationToken
      });
      expect(nextResponse.data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(nextResponse.paginationToken).toBeUndefined();
    });

    test('Get identity permissions by identity with limit on number of identity permissions', async () => {
      const limit = 1;
      mockDDB
        .on(QueryCommand, {
          IndexName: 'getIdentityPermissionsByIdentity',
          Limit: limit
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem],
          LastEvaluatedKey: { pk: { S: samplePartitionKey } }
        });

      const { data, paginationToken } =
        await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
          identityId: sampleGroupId,
          identityType: sampleGroupType,
          limit
        });
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(paginationToken).toStrictEqual(base64PaginationToken);
    });

    test('Get identity permissions by identity default to MAX_API_PAGE_SIZE if limit exceeds it', async () => {
      const limit = MAX_API_PAGE_SIZE + 1;
      mockDDB
        .on(QueryCommand, {
          IndexName: 'getIdentityPermissionsByIdentity',
          Limit: MAX_API_PAGE_SIZE
        })
        .resolvesOnce({
          Items: [mockIdentityPermissionItem],
          LastEvaluatedKey: { pk: { S: samplePartitionKey } }
        });

      const { data, paginationToken } =
        await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
          identityId: sampleGroupId,
          identityType: sampleGroupType,
          limit
        });
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
      expect(paginationToken).toStrictEqual(base64PaginationToken);
    });
  });
  describe('deleteIdentityPermissions', () => {
    test('Delete an identity permission', async () => {
      mockDDB
        .on(TransactWriteItemsCommand, {
          TransactItems: [
            {
              Delete: {
                Key: {
                  pk: { S: `${sampleSubjectType}|${sampleSubjectId}` },
                  sk: { S: [sampleAction, sampleEffect, sampleGroupType, sampleGroupId].join('|') }
                },
                TableName: ddbTableName
              }
            }
          ]
        })
        .resolvesOnce({});

      const { data } = await dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions({
        identityPermissions: [mockIdentityPermission],
        authenticatedUser: mockAuthenticatedUser
      });

      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });

    test('Delete an identity permission, transaction canceled should throw RetryError', async () => {
      const mockTransactionCanceledException = new TransactionCanceledException({
        message: 'Transaction cancelled',
        $metadata: {}
      });
      mockDDB
        .on(TransactWriteItemsCommand, {
          TransactItems: [
            {
              Delete: {
                Key: {
                  pk: { S: `${sampleSubjectType}|${sampleSubjectId}` },
                  sk: { S: [sampleAction, sampleEffect, sampleGroupType, sampleGroupId].join('|') }
                },
                TableName: ddbTableName
              }
            }
          ]
        })
        .rejectsOnce(mockTransactionCanceledException);

      await expect(
        dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions({
          identityPermissions: [mockIdentityPermission],
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(RetryError);
    });
    test('Delete an identity permission, exceeds 100 should throw ThroughputExceededError', async () => {
      const exceededIdentities = Array(101).fill(mockIdentityPermission);

      await expect(
        dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions({
          identityPermissions: exceededIdentities,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(ThroughputExceededError);
    });

    test('Delete an identity permission, random error encountered should be thrown', async () => {
      mockDDB
        .on(TransactWriteItemsCommand, {
          TransactItems: [
            {
              Delete: {
                Key: {
                  pk: { S: `${sampleSubjectType}|${sampleSubjectId}` },
                  sk: { S: [sampleAction, sampleEffect, sampleGroupType, sampleGroupId].join('|') }
                },
                TableName: ddbTableName
              }
            }
          ]
        })
        .rejectsOnce(new Error());

      await expect(
        dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions({
          identityPermissions: [mockIdentityPermission],
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(Error);
    });
  });

  describe('deleteSubjectIdentityPermissions', () => {
    test.skip('Delete subject identity permission', async () => {
      dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject = jest.fn().mockResolvedValue({
        data: {
          identityPermissions: [mockIdentityPermission]
        }
      });

      const { data } = await dynamoDBDynamicPermissionsPlugin.deleteSubjectIdentityPermissions({
        authenticatedUser: mockAuthenticatedUser,
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType
      });

      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });

    test('Delete subject identity exceeding 100 permissions', async () => {
      dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: Array(100).fill(mockIdentityPermission)
          },
          paginationToken: 'test_token'
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: [mockIdentityPermission]
          }
        });
      dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions = jest.fn();

      const { data } = await dynamoDBDynamicPermissionsPlugin.deleteSubjectIdentityPermissions({
        authenticatedUser: mockAuthenticatedUser,
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType
      });

      expect(dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions).toBeCalledTimes(2);
      expect(data.identityPermissions).toStrictEqual(Array(101).fill(mockIdentityPermission));
    });

    test.skip('Gracefully handles subject without identity permissions', async () => {
      dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject = jest.fn().mockResolvedValue({
        data: {
          identityPermissions: []
        }
      });

      const { data } = await dynamoDBDynamicPermissionsPlugin.deleteSubjectIdentityPermissions({
        authenticatedUser: mockAuthenticatedUser,
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType
      });

      expect(data.identityPermissions).toStrictEqual([]);
    });
  });
});
