import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
  GetItemCommand,
  BatchWriteItemCommand,
  ServiceInputTypes,
  ServiceOutputTypes
} from '@aws-sdk/client-dynamodb';
import { AwsService } from '@aws/workbench-core-base';
import { mockClient, AwsStub } from 'aws-sdk-client-mock';
import { Action } from '../action';
import { Effect } from '../permission';
import { IdentityPermission } from './dynamicPermissionsPluginInputs';
import { DynamoDBDynamicPermissionsPlugin } from './dynamoDBDynamicPermissionsPlugin';
import { BadConfigurationError } from './errors/badConfigurationError';
import { GroupAlreadyExistsError } from './errors/groupAlreadyExistsError';
import { GroupNotFoundError } from './errors/groupNotFoundError';

describe('DynamoDB Permissions Plugin', () => {
  const region = 'us-east-1';
  const ddbTableName = 'PermissionsTable';
  const getResourceBySortKeyIndex = 'getResourceBySortKey';

  let dynamoDBDynamicPermissionsPlugin: DynamoDBDynamicPermissionsPlugin;
  let awsService: AwsService;
  let mockDDB: AwsStub<ServiceInputTypes, ServiceOutputTypes>;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    awsService = new AwsService({ region, ddbTableName });
    dynamoDBDynamicPermissionsPlugin = new DynamoDBDynamicPermissionsPlugin({
      awsService,
      getResourceBySortKeyIndex
    });

    mockDDB = mockClient(DynamoDBClient);
  });

  describe('init', () => {
    test('Empty table should result in a successful init', async () => {
      mockDDB.on(ScanCommand).resolves({
        Count: 0
      });
      const response = await dynamoDBDynamicPermissionsPlugin.init({});
      expect(response.success).toBe(true);
    });

    test('Non empty table should result in a failed init', async () => {
      mockDDB.on(ScanCommand).resolves({
        Count: 1
      });
      try {
        await dynamoDBDynamicPermissionsPlugin.init({});
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(BadConfigurationError);
        expect(err.message).toBe('DynamoDB is not empty');
      }
    });

    test('Missing gsi should result in BadConfigurationError error thown', async () => {
      const mockResourceNotFoundException = new Error();
      mockResourceNotFoundException.name = 'ResourceNotFoundException';
      mockDDB.on(ScanCommand).resolves({
        Count: 0
      });

      mockDDB
        .on(ScanCommand, {
          TableName: ddbTableName,
          IndexName: getResourceBySortKeyIndex
        })
        .rejects(mockResourceNotFoundException);
      try {
        await dynamoDBDynamicPermissionsPlugin.init({});
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(BadConfigurationError);
        expect(err.message).toBe('DynamoDB is not configured');
      }
    });

    test('Initialize with admin group and admin permissions', async () => {
      mockDDB.on(ScanCommand).resolves({
        Count: 0
      });
      mockDDB.on(UpdateItemCommand).resolves({});
      const adminId = 'adminId';
      const adminPermissions: IdentityPermission[] = [
        {
          effect: 'ALLOW',
          action: 'CREATE',
          subjectId: 'sampleId',
          subjectType: 'sampleType',
          identityId: adminId,
          identityType: 'GROUP'
        },
        {
          effect: 'ALLOW',
          action: 'UPDATE',
          subjectId: 'sampleId',
          subjectType: 'sampleType',
          identityId: adminId,
          identityType: 'GROUP'
        }
      ];
      const response = await dynamoDBDynamicPermissionsPlugin.init({
        groupsToBeCreated: {
          groupIds: [adminId]
        },
        identityPermissionsToBeCreated: adminPermissions
      });
      expect(response.success).toBe(true);
    });
  });

  describe('DynamicPermissions Functions', () => {
    const sampleGroupId = 'sampleGroup';
    const sampleUserId = 'sampleUser';

    const sampleAssignedPK = `assigned#USER#${sampleUserId}`;
    const sampleAssignedSK = `assigned#GROUP#${sampleGroupId}`;

    const sampleGroupIdentity = `ip#GROUP#${sampleGroupId}`;
    const sampleAction: Action = 'CREATE';
    const sampleEffect: Effect = 'ALLOW';
    const sampleSubjectType = 'sampleSubjectType';
    const sampleSubjectId = 'sampleSubjectId';
    const sampleIpPK = `ip#${sampleSubjectType}#${sampleSubjectId}`;
    const sampleIpSK = `ip##${sampleGroupId}`;
    const sampleConditions = {};
    const sampleFields: string[] = [];

    const mockIdentityPermissionItem = {
      pk: { S: sampleIpPK },
      sk: { S: sampleIpSK },
      action: { S: sampleAction },
      effect: { S: sampleEffect },
      subjectType: { S: sampleSubjectType },
      subjectId: { S: sampleSubjectId },
      identity: { S: sampleGroupIdentity },
      conditions: { M: sampleConditions },
      fields: { L: [] }
    };

    const mockIdentityPermission: IdentityPermission = {
      action: sampleAction,
      effect: sampleEffect,
      subjectType: sampleSubjectType,
      subjectId: sampleSubjectId,
      identityId: sampleGroupId,
      identityType: 'GROUP',
      conditions: sampleConditions,
      fields: sampleFields
    };

    describe('Before init unsuccessful', () => {
      test('createGroup', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.createGroup({
            groupId: sampleGroupId
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });
      test('deleteGroup', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.deleteGroup({
            groupId: sampleGroupId
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });

      test('getUserGroups', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.getUserGroups({
            userId: sampleUserId
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });

      test('getUsersFromGroup', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.getUsersFromGroup({
            groupId: sampleGroupId
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });

      test('createIdentityPermissions', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
            identityPermissions: [mockIdentityPermission]
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });

      test('deleteIdentityPermissions', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions({
            identityPermissions: [mockIdentityPermission]
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });

      test('deleteSubjectPermissions', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.deleteSubjectPermissions({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });
      test('assignUserToGroup', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.assignUserToGroup({
            userId: sampleUserId,
            groupId: sampleGroupId
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });

      test('removeUserFromGroup', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.removeUserFromGroup({
            userId: sampleUserId,
            groupId: sampleGroupId
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });
      test('getIdentityPermissionsByIdentity', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
            identityId: sampleGroupId,
            identityType: 'GROUP'
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });
      test('getIdentityPermissionsBySubject', async () => {
        try {
          await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadConfigurationError);
          expect(err.message).toBe('Not Initialized');
        }
      });
    });

    describe('After init successful', () => {
      beforeEach(async () => {
        mockDDB.on(ScanCommand).resolves({
          Count: 0
        });
        await dynamoDBDynamicPermissionsPlugin.init({});
      });

      describe('createGroup', () => {
        test('Create a valid group should result in success', async () => {
          mockDDB.on(UpdateItemCommand).resolves({});
          const response = await dynamoDBDynamicPermissionsPlugin.createGroup({
            groupId: sampleGroupId
          });
          expect(response.created).toBe(true);
        });

        test('Create an existing group should result in GroupAlreadyExistsError error thrown', async () => {
          const mockConditionalCheckFailedException = new Error();
          mockConditionalCheckFailedException.name = 'ConditionalCheckFailedException';
          mockDDB.on(UpdateItemCommand).rejects(mockConditionalCheckFailedException);
          try {
            await dynamoDBDynamicPermissionsPlugin.createGroup({
              groupId: sampleGroupId
            });
            expect.hasAssertions();
          } catch (err) {
            expect(err).toBeInstanceOf(GroupAlreadyExistsError);
            expect(err.message).toBe('Group already exists');
          }
        });
        test('Error creating group should throw', async () => {
          const mockRandomError = new Error('Random Error');
          mockDDB.on(UpdateItemCommand).rejects(mockRandomError);
          try {
            await dynamoDBDynamicPermissionsPlugin.createGroup({
              groupId: sampleGroupId
            });
            expect.hasAssertions();
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('Random Error');
          }
        });
      });

      describe('deleteGroup', () => {
        test('Delete an existing group with identity permissions and assigned users', async () => {
          const mockAssignedUsers = [
            {
              pk: { S: sampleAssignedPK },
              sk: { S: sampleAssignedSK }
            }
          ];
          const mockIdentityPermissionsItems = [mockIdentityPermissionItem];
          mockDDB
            .on(QueryCommand)
            .resolvesOnce({
              Items: mockAssignedUsers
            })
            .resolvesOnce({
              Items: mockIdentityPermissionsItems
            });
          mockDDB.on(BatchWriteItemCommand).resolves({});
          mockDDB.on(DeleteItemCommand).resolves({});
          const response = await dynamoDBDynamicPermissionsPlugin.deleteGroup({ groupId: sampleGroupId });
          expect(response.deleted).toBe(true);
        });

        test('Delete a non existent group', async () => {
          mockDDB.on(QueryCommand).resolves({});
          mockDDB.on(DeleteItemCommand).resolves({});

          const response = await dynamoDBDynamicPermissionsPlugin.deleteGroup({ groupId: sampleGroupId });
          expect(response.deleted).toBe(true);
        });

        test('Delete a existing group with assigned users', async () => {
          const mockAssignedUsers = [
            {
              pk: { S: sampleAssignedPK },
              sk: { S: sampleAssignedSK }
            }
          ];
          mockDDB
            .on(QueryCommand)
            .resolvesOnce({
              Items: mockAssignedUsers
            })
            .resolves({});
          mockDDB.on(BatchWriteItemCommand).resolvesOnce({});
          mockDDB.on(DeleteItemCommand).resolves({});

          const response = await dynamoDBDynamicPermissionsPlugin.deleteGroup({ groupId: sampleGroupId });
          expect(response.deleted).toBe(true);
        });
      });

      describe('getUserGroups', () => {
        test('Get groups assigned to the user', async () => {
          const mockUserAssignedGroups = [
            {
              pk: { S: sampleAssignedPK },
              sk: { S: sampleAssignedSK }
            }
          ];
          mockDDB
            .on(QueryCommand)
            .resolvesOnce({
              Items: mockUserAssignedGroups
            })
            .resolves({});
          const response = await dynamoDBDynamicPermissionsPlugin.getUserGroups({ userId: sampleUserId });

          expect(response.groupIds).toStrictEqual([sampleGroupId]);
        });

        test('No groups assigned to user', async () => {
          mockDDB.on(QueryCommand).resolvesOnce({});
          const response = await dynamoDBDynamicPermissionsPlugin.getUserGroups({ userId: sampleUserId });

          expect(response.groupIds).toStrictEqual([]);
        });
      });

      describe('getUsersFromGroup', () => {
        test('Get users assigned to the group', async () => {
          const mockAssignedUsers = [
            {
              pk: { S: sampleAssignedPK },
              sk: { S: sampleAssignedSK }
            }
          ];
          mockDDB.on(QueryCommand).resolvesOnce({
            Items: mockAssignedUsers
          });
          const response = await dynamoDBDynamicPermissionsPlugin.getUsersFromGroup({
            groupId: sampleGroupId
          });
          expect(response.userIds).toStrictEqual([sampleUserId]);
        });
        test('No users assigned to group', async () => {
          mockDDB.on(QueryCommand).resolvesOnce({});
          const response = await dynamoDBDynamicPermissionsPlugin.getUsersFromGroup({
            groupId: sampleGroupId
          });
          expect(response.userIds).toStrictEqual([]);
        });
      });

      describe('createIdentityPermissions', () => {
        const failedIdentityPermission: IdentityPermission = {
          action: sampleAction,
          effect: sampleEffect,
          subjectType: sampleSubjectType,
          subjectId: sampleSubjectId,
          identityId: sampleUserId,
          identityType: 'USER',
          conditions: sampleConditions,
          fields: sampleFields
        };
        test('Create identity permission', async () => {
          const mockIdentityPermissions: IdentityPermission[] = [mockIdentityPermission];
          mockDDB.on(UpdateItemCommand).resolvesOnce({});

          const response = await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
            identityPermissions: mockIdentityPermissions
          });
          expect(response.created).toBe(true);
          expect(response.unprocessedIdentityPermissions).toBeUndefined();
        });
        test('Create identity permission with one failed to create should return unprocessed permissions', async () => {
          const mockConditionalCheckFailedException = new Error();
          mockConditionalCheckFailedException.name = 'ConditionalCheckFailedException';
          const mockIdentityPermissions: IdentityPermission[] = [
            mockIdentityPermission,
            failedIdentityPermission
          ];
          mockDDB.on(UpdateItemCommand).resolvesOnce({}).rejectsOnce(mockConditionalCheckFailedException);

          const response = await dynamoDBDynamicPermissionsPlugin.createIdentityPermissions({
            identityPermissions: mockIdentityPermissions
          });
          expect(response.created).toBe(false);
          expect(response.unprocessedIdentityPermissions).toStrictEqual([failedIdentityPermission]);
        });
      });

      describe('deleteIdentityPermissions', () => {
        test('Delete a identity permission', async () => {
          mockDDB.on(BatchWriteItemCommand).resolves({});

          await dynamoDBDynamicPermissionsPlugin.deleteIdentityPermissions({
            identityPermissions: [mockIdentityPermission]
          });
        });
      });

      describe('deleteSubjectPermissions', () => {
        test('Delete a subject permissions', async () => {
          mockDDB.on(QueryCommand).resolvesOnce({
            Items: [mockIdentityPermissionItem]
          });

          mockDDB.on(BatchWriteItemCommand).resolvesOnce({});

          await dynamoDBDynamicPermissionsPlugin.deleteSubjectPermissions({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType
          });
        });
      });

      describe('assignUserToGroup', () => {
        const groupItem = {
          pk: { S: `groupids#GROUP#${sampleGroupId}` },
          sk: { S: `groupids#GROUP#${sampleGroupId}` }
        };
        test('Assign user to an existing group', async () => {
          mockDDB.on(GetItemCommand).resolves({
            Item: groupItem
          });

          mockDDB.on(UpdateItemCommand).resolvesOnce({});

          const response = await dynamoDBDynamicPermissionsPlugin.assignUserToGroup({
            groupId: sampleGroupId,
            userId: sampleUserId
          });
          expect(response.assigned).toBe(true);
        });

        test('Assign user to a nonexistent results in a GroupNotFoundError thrown', async () => {
          try {
            mockDDB.on(GetItemCommand).resolves({});
            await dynamoDBDynamicPermissionsPlugin.assignUserToGroup({
              groupId: sampleGroupId,
              userId: sampleUserId
            });
            expect.hasAssertions();
          } catch (err) {
            expect(err).toBeInstanceOf(GroupNotFoundError);
            expect(err.message).toBe('Group not found');
          }
        });
      });

      describe('removeUserFromGroup', () => {
        test('remove user from existing group', async () => {
          mockDDB.on(DeleteItemCommand).resolves({});

          await dynamoDBDynamicPermissionsPlugin.removeUserFromGroup({
            userId: sampleUserId,
            groupId: sampleGroupId
          });
        });
      });

      describe('getIdentityPermissionsBySubject', () => {
        const keyConditionExpression = '#pk = :pk';
        test('Get identity permissions by subject, filter on action and groupId', async () => {
          const filterExpression = '#a = :a AND #id IN ( :id0 )';
          const attributeNames = { '#pk': 'pk', '#a': 'action', '#id': 'identity' };
          const attributeValues = {
            ':pk': { S: 'ip#sampleSubjectType#sampleSubjectId' },
            ':a': { S: 'CREATE' },
            ':id0': { S: 'ip#GROUP#sampleGroup' }
          };
          mockDDB
            .on(QueryCommand, {
              FilterExpression: filterExpression,
              ExpressionAttributeNames: attributeNames,
              ExpressionAttributeValues: attributeValues,
              KeyConditionExpression: keyConditionExpression
            })
            .resolvesOnce({
              Items: [mockIdentityPermissionItem]
            });

          const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType,
            action: sampleAction,
            identities: [{ identityId: sampleGroupId, identityType: 'GROUP' }]
          });
          expect(response.identityPermissions).toStrictEqual([mockIdentityPermission]);
        });

        test('Get identity permissions by subject, filter on action', async () => {
          const filterExpression = '#a = :a';
          const attributeNames = { '#pk': 'pk', '#a': 'action' };
          const attributeValues = {
            ':pk': { S: 'ip#sampleSubjectType#sampleSubjectId' },
            ':a': { S: 'CREATE' }
          };
          mockDDB
            .on(QueryCommand, {
              FilterExpression: filterExpression,
              ExpressionAttributeNames: attributeNames,
              ExpressionAttributeValues: attributeValues,
              KeyConditionExpression: keyConditionExpression
            })
            .resolvesOnce({
              Items: [mockIdentityPermissionItem]
            });
          const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType,
            action: sampleAction
          });
          expect(response.identityPermissions).toStrictEqual([mockIdentityPermission]);
        });
        test('Get identity permissions by subject, filter on groupid', async () => {
          const filterExpression = '#id IN ( :id0 )';
          const attributeNames = { '#pk': 'pk', '#id': 'identity' };
          const attributeValues = {
            ':pk': { S: 'ip#sampleSubjectType#sampleSubjectId' },
            ':id0': { S: 'ip#GROUP#sampleGroup' }
          };
          mockDDB
            .on(QueryCommand, {
              FilterExpression: filterExpression,
              ExpressionAttributeNames: attributeNames,
              ExpressionAttributeValues: attributeValues,
              KeyConditionExpression: keyConditionExpression
            })
            .resolvesOnce({
              Items: [mockIdentityPermissionItem]
            });

          const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType,
            identities: [{ identityId: sampleGroupId, identityType: 'GROUP' }]
          });
          expect(response.identityPermissions).toStrictEqual([mockIdentityPermission]);
        });

        test('Get identity permissions by subject', async () => {
          mockDDB.on(QueryCommand).resolvesOnce({
            Items: [mockIdentityPermissionItem]
          });

          const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType
          });
          expect(response.identityPermissions).toStrictEqual([mockIdentityPermission]);
        });

        test('No identity permissions associated to subject', async () => {
          mockDDB.on(QueryCommand).resolvesOnce({});

          const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsBySubject({
            subjectId: sampleSubjectId,
            subjectType: sampleSubjectType
          });
          expect(response.identityPermissions).toStrictEqual([]);
        });
      });

      describe('getIdentityPermissionsByIdentity', () => {
        test('Get identity permissions from sampleGroupId', async () => {
          mockDDB
            .on(QueryCommand, {
              IndexName: getResourceBySortKeyIndex
            })
            .resolvesOnce({
              Items: [mockIdentityPermissionItem]
            });

          const response = await dynamoDBDynamicPermissionsPlugin.getIdentityPermissionsByIdentity({
            identityType: 'GROUP',
            identityId: sampleGroupId
          });

          expect(response.identityPermissions).toStrictEqual([mockIdentityPermission]);
        });
      });
    });
  });
});
