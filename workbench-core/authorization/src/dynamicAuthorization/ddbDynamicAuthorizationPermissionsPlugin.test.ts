/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient,
  ServiceInputTypes,
  ServiceOutputTypes,
  TransactWriteItemsCommand,
  TransactionCanceledException
} from '@aws-sdk/client-dynamodb';
import { AwsService, JSONValue } from '@aws/workbench-core-base';
import { mockClient, AwsStub } from 'aws-sdk-client-mock';
import { Action } from '../action';
import { AuthenticatedUser } from '../authenticatedUser';
import { Effect } from '../effect';
import { IdentityPermissionCreationError } from '../errors/identityPermissionCreationError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { DDBDynamicAuthorizationPermissionsPlugin } from './ddbDynamicAuthorizationPermissionsPlugin';
import { IdentityPermission, IdentityType } from './dynamicAuthorizationInputs/identityPermission';

describe('DDB Dynamic Authorization Permissions Plugin tests', () => {
  let region: string;
  let ddbTableName;
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
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache

    ddbTableName = 'PermissionsTable';
    region = 'us-east-1';
    mockAuthenticatedUser = {
      id: 'sampleUserId',
      roles: []
    };

    awsService = new AwsService({ region, ddbTableName });
    dynamoDBDynamicPermissionsPlugin = new DDBDynamicAuthorizationPermissionsPlugin({
      dynamoDBService: awsService.helpers.ddb
    });

    mockDDB = mockClient(DynamoDBClient);

    sampleGroupId = 'sampleGroup';
    sampleGroupType = 'GROUP';
    sampleAction = 'CREATE';
    sampleEffect = 'ALLOW';
    sampleSubjectType = 'sampleSubjectType';
    sampleSubjectId = 'sampleSubjectId';
    sampleConditions = {};
    sampleFields = [];
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
  });

  describe('isRouteIgnored', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamoDBDynamicPermissionsPlugin.isRouteIgnored({ route: '', method: 'GET' })
      ).rejects.toThrow(Error);
    });
  });

  describe('isRouteProtected', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamoDBDynamicPermissionsPlugin.isRouteProtected({ route: '', method: 'GET' })
      ).rejects.toThrow(Error);
    });
  });

  describe('getDynamicOperationsByRoute', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamoDBDynamicPermissionsPlugin.getDynamicOperationsByRoute({ route: '', method: 'GET' })
      ).rejects.toThrow(Error);
    });
  });

  describe('getIdentityPermissionsByIdentity', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
          identityId: '',
          identityType: 'GROUP'
        })
      ).rejects.toThrow(Error);
    });
  });

  describe('getIdentityPermissionsBySubject', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
          authenticatedUser: mockAuthenticatedUser,
          subjectId: '',
          subjectType: ''
        })
      ).rejects.toThrow(Error);
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
  });

  describe('deleteIdentityPermissions', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions({
          authenticatedUser: mockAuthenticatedUser,
          identityPermissions: []
        })
      ).rejects.toThrow(Error);
    });
  });
});
