/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const expectedUuid = '123';
const projId = `proj-${expectedUuid}`;
jest.mock('uuid', () => ({ v4: () => expectedUuid }));

import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { mockClient } from 'aws-sdk-client-mock';
import Project from '../models/project';
import ProjectService from './projectService';

describe('ProjectService', () => {
  const ddbMock = mockClient(DynamoDBClient);
  const TABLE_NAME = 'exampleDDBTable';
  const projService = new ProjectService({ TABLE_NAME });
  const timestamp = '2022-05-18T20:33:42.608Z';
  const mockDateObject = new Date(timestamp);

  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementationOnce(() => mockDateObject.getTime());
  });

  // Project object
  const proj: Project = {
    hostingAccountHandlerRoleArn: 'arn:aws:iam::1234566789:role/swb-dev-va-cross-account-role',
    accountId: 'acc-123',
    awsAccountId: '123456789012',
    createdAt: timestamp,
    description: 'Example project',
    costCenterId: 'cc-123',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    externalId: 'workbench',
    id: `${projId}`,
    name: 'Example project',
    subnetId: 'subnet-07f475d83291a3603',
    updatedAt: timestamp,
    vpcId: 'vpc-0b0bc7ae01d82e7b3',
    status: 'AVAILABLE'
  };

  // DDB object for project item
  const projItem: { [key: string]: string } = {
    ...proj,
    pk: `PROJ#${projId}`,
    sk: `PROJ#${projId}`,
    resourceType: 'project',
    dependency: proj.costCenterId
  };
  delete projItem.costCenterId;

  // DDB object for cost item
  const costCenterItem = {
    pk: 'CC#cc-123',
    sk: 'CC#cc-123',
    hostingAccountHandlerRoleArn: 'arn:aws:iam::1234566789:role/swb-dev-va-cross-account-role',
    awsAccountId: '123456789012',
    createdAt: timestamp,
    desc: 'Example cost center',
    dependency: 'acc-123',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    externalId: 'workbench',
    id: 'cc-123',
    name: 'Example cost center',
    subnetId: 'subnet-07f475d83291a3603',
    updatedAt: timestamp,
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

    test('list projects as IT Admin when no projects exist', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
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
      expect(actualResponse.data).toEqual([]);
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
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on more than 1 page -- getting first page', async () => {
      // BUILD
      const items = [projItem, projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        resourceType: projItem.resourceType,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: [proj, proj], paginationToken: paginationToken };
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
        resourceType: projItem.resourceType,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: [proj, proj], paginationToken: paginationToken };
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
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as user in multiple groups on 1 page when pageSize > number of projects', async () => {
      // BUILD
      const items = [projItem, projItem];
      const pageSize = 3;
      const expectedResponse = { data: [proj, proj], paginationToken: undefined };
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
        resourceType: projItem.resourceType,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: [proj, proj], paginationToken: paginationToken };
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
        resourceType: projItem.resourceType,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 3;
      const expectedResponse = { data: [proj, proj, proj], paginationToken: paginationToken };
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
        resourceType: projItem.resourceType,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 3;
      const expectedResponse = { data: [proj, proj, proj], paginationToken: paginationToken };
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
    let user: AuthenticatedUser;
    beforeAll(() => {
      user = {
        id: 'user-123',
        roles: []
      };
    });
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
      const actualResponse = await projService.getProject({ user, projectId: 'proj-123' });

      // CHECK
      expect(actualResponse).toEqual(proj);
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
      await expect(projService.getProject({ user, projectId: 'proj-123' })).rejects.toThrow(
        'Could not find project proj-123'
      );
    });
  });

  describe('createProject', () => {
    test('create a project with valid name', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['ITAdmin']
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Count: 0,
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType AND #name = :name',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      const getCostCenterGetItemResponse: GetItemCommandOutput = {
        Item: marshall(costCenterItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves(getCostCenterGetItemResponse);

      // mock ddb update item
      ddbMock.on(UpdateItemCommand).resolves({});

      // mock final get Project after success
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(projItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: `PROJ#${projId}`,
            sk: `PROJ#${projId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await projService.createProject(params, user);

      // CHECK
      expect(actualResponse).toEqual(proj);
    });

    test('fail on create a project with name already in use', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['ITAdmin']
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Items: [marshall(projItem)],
        Count: 1,
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType AND #name = :name',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      const getCostCenterGetItemResponse: GetItemCommandOutput = {
        Item: marshall(costCenterItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves(getCostCenterGetItemResponse);

      // OPERATE n CHECK
      await expect(projService.createProject(params, user)).rejects.toThrow(
        'Project name "Example project" is in use by a non deleted project. Please use another name.'
      );
    });

    test('fail on create a project with invalid cost center id', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['ITAdmin']
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Count: 0,
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType AND #name = :name',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves({});

      // OPERATE n CHECK
      await expect(projService.createProject(params, user)).rejects.toThrow(
        'Could not find cost center cc-123'
      );
    });

    test('fail on update to DDB call', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };
      const user: AuthenticatedUser = {
        id: 'user-123',
        roles: ['ITAdmin']
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Count: 0,
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType AND #name = :name',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      const getCostCenterGetItemResponse: GetItemCommandOutput = {
        Item: marshall(costCenterItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves(getCostCenterGetItemResponse);

      // mock update to DDB
      ddbMock.on(UpdateItemCommand).rejects('Failed to update DDB');

      // OPERATE n CHECK
      await expect(projService.createProject(params, user)).rejects.toThrow('Failed to create project');
    });
  });
});
