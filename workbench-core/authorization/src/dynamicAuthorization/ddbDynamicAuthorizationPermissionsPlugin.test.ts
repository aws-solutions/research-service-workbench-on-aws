import {
  DynamoDBClient,
  ServiceInputTypes,
  ServiceOutputTypes,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { AwsService } from '@aws/workbench-core-base';
import { mockClient, AwsStub } from 'aws-sdk-client-mock';
import { Action } from '../action';
import { IdentityPermissionAlreadyExistError } from '../errors/identityPermissionAlreadyExistError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { Effect } from '../permission';
import { DDBDynamicAuthorizationPermissionsPlugin } from './ddbDynamicAuthorizationPermissionsPlugin';
import { IdentityPermission, IdentityType } from './dynamicAuthorizationInputs/identityPermission';

describe('DDB Dynamic Authorization Permissions Plugin tests', () => {
  const region = 'us-east-1';
  const ddbTableName = 'PermissionsTable';
  const mockAuthenticatedUser = {
    id: 'sampleUserId',
    roles: []
  };

  let dynamoDBDynamicPermissionsPlugin: DDBDynamicAuthorizationPermissionsPlugin;
  let awsService: AwsService;
  let mockDDB: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  const sampleGroupId = 'sampleGroup';
  const sampleGroupType: IdentityType = 'GROUP';

  const sampleAction: Action = 'CREATE';
  const sampleEffect: Effect = 'ALLOW';
  const sampleSubjectType = 'sampleSubjectType';
  const sampleSubjectId = 'sampleSubjectId';
  const sampleConditions = {};
  const sampleFields: string[] = [];
  const sampleDescription: string = 'sampleDescription';

  const mockIdentityPermission: IdentityPermission = {
    action: sampleAction,
    effect: sampleEffect,
    subjectType: sampleSubjectType,
    subjectId: sampleSubjectId,
    identityId: sampleGroupId,
    identityType: sampleGroupType,
    conditions: sampleConditions,
    fields: sampleFields,
    description: sampleDescription
  } as const;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    awsService = new AwsService({ region, ddbTableName });
    dynamoDBDynamicPermissionsPlugin = new DDBDynamicAuthorizationPermissionsPlugin({
      awsService
    });

    mockDDB = mockClient(DynamoDBClient);
  });

  describe('createIdentityPermissions tests', () => {
    const failedIdentityPermission: IdentityPermission = {
      action: sampleAction,
      effect: sampleEffect,
      subjectType: sampleSubjectType,
      subjectId: sampleSubjectId,
      identityId: sampleGroupId,
      identityType: sampleGroupType,
      conditions: sampleConditions,
      fields: sampleFields
    };
    test('Create identity permissions', async () => {
      const mockIdentityPermissions: IdentityPermission[] = [mockIdentityPermission];
      mockDDB.on(TransactWriteItemsCommand).resolvesOnce({});

      const response = await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
        identityPermissions: mockIdentityPermissions,
        authenticatedUser: mockAuthenticatedUser
      });
      expect(response.identityPermissions).toBe(mockIdentityPermissions);
    });
    test('Create identity permissions with one failed should throw ConditionalCheckFailedException', async () => {
      const mockConditionalCheckFailedException = new Error();
      mockConditionalCheckFailedException.name = 'ConditionalCheckFailedException';
      const mockIdentityPermissions: IdentityPermission[] = [
        mockIdentityPermission,
        failedIdentityPermission
      ];
      mockDDB.on(TransactWriteItemsCommand).rejectsOnce(mockConditionalCheckFailedException);

      await expect(
        async () =>
          await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
            identityPermissions: mockIdentityPermissions,
            authenticatedUser: mockAuthenticatedUser
          })
      ).rejects.toThrow(IdentityPermissionAlreadyExistError);
    });

    test('Create identity permissions that exceeds 100 identity permissions should throw ThroughputExceededError', async () => {
      const identityPermissions = Array(101).fill(mockIdentityPermission);
      await expect(
        async () =>
          await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
            identityPermissions,
            authenticatedUser: mockAuthenticatedUser
          })
      ).rejects.toThrow(ThroughputExceededError);
    });
  });
});
