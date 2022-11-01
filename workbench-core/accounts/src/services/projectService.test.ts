/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import ProjectService from './projectService';

describe('ProjectService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const ddbMock = mockClient(DynamoDBClient);
  const TABLE_NAME = 'exampleDDBTable';
  const projService = new ProjectService({ TABLE_NAME });

  const projItem = {
    pk: 'PROJ#proj-123',
    sk: 'PROJ#proj-123',
    accountHandlerRoleArn: 'arn:aws:iam::1234566789:role/swb-dev-va-cross-account-role',
    accountId: 'acc-123',
    awsAccountId: '123456789012',
    createdAt: '2022-05-18T20:33:42.608Z',
    createdBy: 'abc',
    desc: 'Example project',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    externalId: 'workbench',
    id: 'proj-123',
    indexId: 'index-123',
    name: 'Example project',
    projectAdmins: [],
    resourceType: 'project',
    subnetId: 'subnet-07f475d83291a3603',
    updatedAt: '2022-05-18T20:33:42.608Z',
    updatedBy: 'abc',
    vpcId: 'vpc-0b0bc7ae01d82e7b3'
  };

  describe('listProjects', () => {
    test('list all projects with no group membership', async () => {
      // BUILD

      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: []
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ProjectService.prototype as any, '_mockGetUserGroups').mockImplementation(() => []);

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse).toEqual({ data: [] });
    });

    test('list all projects as IT Admin on 1 page', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['ITAdmin']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ProjectService.prototype as any, '_mockGetUserGroups').mockImplementation(() => ['ITAdmin']);

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('list all projects as IT Admin on more than 1 page -- getting first page', async () => {
      // BUILD
      const items = [projItem, projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: items, paginationToken: paginationToken };
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        $metadata: {}
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['ITAdmin']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ProjectService.prototype as any, '_mockGetUserGroups').mockImplementation(() => ['ITAdmin']);

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            }
          },
          Limit: pageSize
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as IT Admin on more than 1 page -- getting page with pagination token', async () => {
      // BUILD
      const items = [projItem, projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: items, paginationToken: paginationToken };
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        $metadata: {}
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['ITAdmin']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(ProjectService.prototype as any, '_mockGetUserGroups').mockImplementation(() => ['ITAdmin']);

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            }
          },
          Limit: pageSize
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize, paginationToken });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list projects when user is only part of 1 groups', async () => {
      // BUILD
      const items = [projItem];
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['PA']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(ProjectService.prototype as any, '_mockGetUserGroups')
        .mockImplementation(() => ['proj-123#PA']);

      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(projItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'PROJ#proj-123',
            sk: 'PROJ#proj-123'
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('list all projects as user in multiple groups on 1 page when pageSize > number of projects', async () => {
      // BUILD
      const items = [projItem, projItem];
      const pageSize = 3;
      const expectedResponse = { data: items, paginationToken: undefined };
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        Count: 2,
        $metadata: {}
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['PA']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(ProjectService.prototype as any, '_mockGetUserGroups')
        .mockImplementation(() => ['proj-123#PA', 'proj-123#PA']);

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':proj1': { S: 'proj-123' },
            ':proj2': { S: 'proj-123' }
          },
          FilterExpression: 'id = :proj1 OR id = :proj2',
          Limit: pageSize
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as user in multiple groups on 1 page exactly', async () => {
      // BUILD
      const items = [projItem, projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: items, paginationToken: paginationToken };
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        Count: 2,
        $metadata: {}
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['PA']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(ProjectService.prototype as any, '_mockGetUserGroups')
        .mockImplementation(() => ['proj-123#PA', 'proj-123#PA']);

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':proj1': { S: 'proj-123' },
            ':proj2': { S: 'proj-123' }
          },
          FilterExpression: 'id = :proj1 OR id = :proj2',
          Limit: pageSize
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as user in multiple groups on 1 page -- getting first page when filter returns less than 1 page', async () => {
      // BUILD
      const itemsP1 = [projItem, projItem];
      const itemsP2 = [projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 3;
      const expectedResponse = { data: [...itemsP1, ...itemsP2], paginationToken: paginationToken };
      const queryItemResponse1: QueryCommandOutput = {
        Items: itemsP1.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        Count: 2,
        $metadata: {}
      };
      const queryItemResponse2: QueryCommandOutput = {
        Items: itemsP2.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        Count: 1,
        $metadata: {}
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['PA']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(ProjectService.prototype as any, '_mockGetUserGroups')
        .mockImplementation(() => ['proj-123#PA', 'proj-123#PA', 'proj-123#PA']);

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':proj1': { S: 'proj-123' },
            ':proj2': { S: 'proj-123' },
            ':proj3': { S: 'proj-123' }
          },
          FilterExpression: 'id = :proj1 OR id = :proj2 OR id = :proj3',
          Limit: pageSize
        })
        .resolvesOnce(queryItemResponse1);
      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: { '#resourceType': 'resourceType' },
          ExpressionAttributeValues: {
            ':resourceType': { S: 'project' },
            ':proj1': { S: 'proj-123' },
            ':proj2': { S: 'proj-123' },
            ':proj3': { S: 'proj-123' }
          },
          FilterExpression: 'id = :proj1 OR id = :proj2 OR id = :proj3',
          Limit: pageSize,
          ExclusiveStartKey: marshall(lastEvaluatedKey)
        })
        .resolvesOnce(queryItemResponse2);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as user in multiple groups on 1 page -- getting second page when filter returns more than 1 page the second time', async () => {
      // BUILD
      const itemsP1 = [projItem, projItem];
      const itemsP2 = [projItem, projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 3;
      const expectedResponse = { data: [...itemsP1, itemsP2[0]], paginationToken: paginationToken };
      const queryItemResponse1: QueryCommandOutput = {
        Items: itemsP1.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        Count: 2,
        $metadata: {}
      };
      const queryItemResponse2: QueryCommandOutput = {
        Items: itemsP2.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        Count: 2,
        $metadata: {}
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['PA']
      };

      // mock getUserGroups--TODO update after dynamic AuthZ intergration
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(ProjectService.prototype as any, '_mockGetUserGroups')
        .mockImplementation(() => ['proj-123#PA', 'proj-123#PA', 'proj-123#PA', 'proj-123#PA']);

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':proj1': { S: 'proj-123' },
            ':proj2': { S: 'proj-123' },
            ':proj3': { S: 'proj-123' },
            ':proj4': { S: 'proj-123' }
          },
          FilterExpression: 'id = :proj1 OR id = :proj2 OR id = :proj3 OR id = :proj4',
          Limit: pageSize
        })
        .resolvesOnce(queryItemResponse1);
      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: { '#resourceType': 'resourceType' },
          ExpressionAttributeValues: {
            ':resourceType': { S: 'project' },
            ':proj1': { S: 'proj-123' },
            ':proj2': { S: 'proj-123' },
            ':proj3': { S: 'proj-123' },
            ':proj4': { S: 'proj-123' }
          },
          FilterExpression: 'id = :proj1 OR id = :proj2 OR id = :proj3 OR id = :proj4',
          Limit: pageSize,
          ExclusiveStartKey: marshall(lastEvaluatedKey)
        })
        .resolvesOnce(queryItemResponse2);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });
  });

  describe('getProject', () => {
    test('getting 1 project', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(projItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'PROJ#proj-123',
            sk: 'PROJ#proj-123'
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await projService.getProject('proj-123');

      // CHECK
      expect(actualResponse).toEqual(getItemResponse.Item);
    });

    test('getting no object', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'PROJ#proj-123',
            sk: 'PROJ#proj-123'
          })
        })
        .resolves(getItemResponse);

      // OPERATE & CHECk
      await expect(projService.getProject('proj-123')).rejects.toThrow('Could not find project proj-123');
    });
  });
});
