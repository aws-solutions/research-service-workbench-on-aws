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
    sk: `PROJ#${projId}`
  };
  delete projItem.accountId;

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

  describe('getProjects', () => {
    test('getting all projects', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

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
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects();

      // CHECK
      expect(actualResponse.data).toEqual(items);
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

  describe('createProject', () => {
    test('create a project with valid name', async () => {
      // BUILD
      const params = {
        name: projItem.name,
        description: projItem.description,
        costCenterId: projItem.costCenterId
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
        name: projItem.name,
        description: projItem.description,
        costCenterId: projItem.costCenterId
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
        name: projItem.name,
        description: projItem.description,
        costCenterId: projItem.costCenterId
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
  });
});
