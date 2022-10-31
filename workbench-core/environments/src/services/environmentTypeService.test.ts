/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable */
import EnvironmentTypeService from './environmentTypeService';
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { debounce } from 'lodash';
const envTypeId = '6a00ee50-6274-4050-9357-1062caa5b916';
jest.mock('uuid', () => ({ v4: () => envTypeId }));

describe('environmentTypeService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  const ddbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();
  });
  const TABLE_NAME = 'exampleDDBTable';
  const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  const envType = {
    status: 'APPROVED',
    createdAt: '2022-06-20T18:32:09.985Z',
    updatedBy: 'owner-123',
    createdBy: 'owner-123',
    name: 'Jupyter Notebook',
    resourceType: 'envType',
    provisioningArtifactId: 'pa-dqwijdnwq12w2',
    params: [],
    updatedAt: '2022-06-20T18:36:14.358Z',
    sk: `ET#${envTypeId}`,
    owner: 'owner-123',
    description: 'An Amazon SageMaker Jupyter Notebook',
    id: envTypeId,
    pk: `ET#${envTypeId}`,
    productId: 'prod-dwqdqdqdwq2e3',
    type: 'sagemaker'
  };
  const envTypeConfigId = '40b01529-0c7f-4609-a1e2-715068da5f0e';
  const envTypeConfig = {
    createdAt: '2022-06-17T16:28:40.360Z',
    updatedBy: 'owner-123',
    createdBy: 'owner-123',
    name: 'config 1',
    allowRoleIds: [],
    resourceType: 'envTypeConfig',
    // provisioningArtifactId: 'pa-dewjn123',
    params: [],
    updatedAt: '2022-06-17T21:25:24.333Z',
    sk: `${resourceTypeToKey.envType}#${envTypeId}${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`,
    owner: 'owner-123',
    description: 'Example config 1',
    id: envTypeConfigId,
    pk: 'ETC',
    // productId: 'prod-dasjk123',
    type: 'sagemaker'
  };
  const listEnvTypeConfigCommandParams = {
    TableName: TABLE_NAME,
    IndexName: 'getResourceByDependency',
    KeyConditionExpression: '#resourceType = :resourceType AND #dependency = :dependency',
    ExpressionAttributeNames: {
      '#resourceType': 'resourceType',
      '#dependency': 'dependency'
    },
    ExpressionAttributeValues: {
      ':resourceType': {
        S: 'envTypeConfig'
      },
      ':dependency': {
        S: envTypeId
      }
    },
    Limit: 50
  };
  const getEnvTypeCommandParams = {
    TableName: TABLE_NAME,
    Key: marshall({
      pk: `${resourceTypeToKey.envType}#${envTypeId}`,
      sk: `${resourceTypeToKey.envType}#${envTypeId}`
    })
  };
  describe('getEnvironmentType', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envType),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: `${resourceTypeToKey.envType}#${envTypeId}`,
            sk: `${resourceTypeToKey.envType}#${envTypeId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envTypeService.getEnvironmentType(envTypeId);

      // CHECK
      expect(actualResponse).toEqual(getItemResponse.Item);
    });

    test('invalid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock.on(GetItemCommand).resolves(getItemResponse);
      const invalidId = 'invalidId-1';

      // OPERATE & CHECK
      await expect(envTypeService.getEnvironmentType(invalidId)).rejects.toThrow(
        `Could not find environment type ${invalidId}`
      );
    });
  });
  describe('getEnvironmentTypes', () => {
    test('validPaginationToken', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: [marshall(envType)],
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: TABLE_NAME,
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'envType'
            }
          }
        })
        .resolves(queryItemResponse);
      const validPaginationToken =
        'eyJzayI6IkVUIzZjNzMyZTExLTg3ZmItNDBlNy1hZTNiLTI1NTE2NThkNzhmMCIsInJlc291cmNlVHlwZSI6ImVudlR5cGUiLCJwayI6IkVUIzZjNzMyZTExLTg3ZmItNDBlNy1hZTNiLTI1NTE2NThkNzhmMCIsInVwZGF0ZWRBdCI6IjIwMjItMDYtMTZUMjI6NDE6MDUuOTYyWiJ9';

      // OPERATE
      const actualResponse = await envTypeService.listEnvironmentTypes({
        pageSize: 1,
        paginationToken: validPaginationToken
      });

      // CHECK
      expect(actualResponse).toEqual({ data: [envType] });
    });

    test('invalidPaginationToken', async () => {
      // BUILD & OPERATE & CHECK
      await expect(
        envTypeService.listEnvironmentTypes({ pageSize: 1, paginationToken: 'invalidPaginationToken' })
      ).rejects.toThrow('Invalid paginationToken');
    });

    test('filters by name successfully with an eq function ', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: [marshall(envType)],
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: TABLE_NAME,
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType AND #name = :name',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'envType'
            },
            ':name': {
              S: 'Jupyter Notebook'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envTypeService.listEnvironmentTypes({
        pageSize: 1,
        filter: { name: { eq: 'Jupyter Notebook' } }
      });

      // CHECK
      expect(actualResponse).toEqual({ data: [envType] });
    });

    test('filters by status successfully with gte function ', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: [marshall(envType)],
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: TABLE_NAME,
          IndexName: 'getResourceByStatus',
          KeyConditionExpression: '#resourceType = :resourceType AND #status >= :status',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'envType'
            },
            ':status': {
              S: 'A'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envTypeService.listEnvironmentTypes({
        pageSize: 1,
        filter: { status: { gte: 'A' } }
      });

      // CHECK
      expect(actualResponse).toEqual({ data: [envType] });
    });

    test('sort by asc status successfully', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: [marshall(envType)],
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: TABLE_NAME,
          IndexName: 'getResourceByStatus',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'envType'
            }
          },
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envTypeService.listEnvironmentTypes({
        pageSize: 1,
        sort: { status: 'asc' }
      });

      // CHECK
      expect(actualResponse).toEqual({ data: [envType] });
    });

    test('sort by desc name successfully', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: [marshall(envType)],
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: TABLE_NAME,
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'envType'
            }
          },
          ScanIndexForward: false
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envTypeService.listEnvironmentTypes({
        pageSize: 1,
        sort: { name: 'desc' }
      });

      // CHECK
      expect(actualResponse).toEqual({ data: [envType] });
    });
  });

  describe('updateEnvironmentType', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envType),
        $metadata: {}
      };
      const configsItemResponse: QueryCommandOutput = {
        Items: [],
        $metadata: {}
      };
      ddbMock.on(GetItemCommand, getEnvTypeCommandParams).resolves(getItemResponse);
      ddbMock.on(QueryCommand, listEnvTypeConfigCommandParams).resolves(configsItemResponse);
      ddbMock
        .on(UpdateItemCommand)
        //@ts-ignore
        .resolves({ Attributes: marshall({ ...envType, name: 'FakeName' }) });

      // OPERATE
      const actualResponse = await envTypeService.updateEnvironmentType('owner-123', envTypeId, {
        name: 'FakeName'
      });

      // CHECK
      expect(actualResponse).toEqual({ ...envType, name: 'FakeName' });
    });

    test('invalid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock.on(GetItemCommand).resolves(getItemResponse);
      const invalidId = 'invalidId-1';
      // OPERATE & CHECK
      await expect(
        envTypeService.updateEnvironmentType('owner-123', invalidId, { name: 'FakeName' })
      ).rejects.toThrow(`Could not find environment type ${invalidId} to update`);
    });

    test('update attributes that are not allowed', async () => {
      // BUILD & OPERATE & CHECK
      await expect(
        envTypeService.updateEnvironmentType('owner-123', envTypeId, {
          productId: 'prod-abcasdewedg42',
          provisioningArtifactId: 'pa-ehksiu2735sha'
        })
      ).rejects.toThrow('We do not support updating these attributes productId,provisioningArtifactId');
    });
    test('should throw exception when revoking environment type with dependencies', async () => {
      // BUILD & OPERATE & CHECK
      const getEnvTypeItemResponse: GetItemCommandOutput = {
        Item: marshall(envType),
        $metadata: {}
      };
      const configsItemResponse: QueryCommandOutput = {
        Items: [marshall(envTypeConfig)],
        $metadata: {}
      };
      ddbMock.on(GetItemCommand, getEnvTypeCommandParams).resolves(getEnvTypeItemResponse);
      ddbMock.on(QueryCommand, listEnvTypeConfigCommandParams).resolves(configsItemResponse);
      const updateBody = { status: 'NOT_APPROVED' };
      await expect(envTypeService.updateEnvironmentType('owner-123', envTypeId, updateBody)).rejects.toThrow(
        `Unable to update environment type: ${envTypeId}  with params: ${JSON.stringify(
          updateBody
        )}, Environment Type has active configurations`
      );
    });
  });

  describe('createNewEnvironmentType', () => {
    const createParams = {
      status: 'APPROVED',
      name: 'Jupyter Notebook',
      provisioningArtifactId: 'pa-ehksiu2735sha',
      params: {},
      description: 'An Amazon SageMaker Jupyter Notebook',
      productId: 'prod-abcasdewedg42',
      type: 'sagemaker'
    };
    test('successfully create envType', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: marshall(envType)
      });

      // OPERATE
      const actualResponse = await envTypeService.createNewEnvironmentType(createParams);

      // CHECK
      expect(actualResponse).toEqual(envType);
    });

    test('failed to create envType', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: undefined
      });

      // OPERATE & CHECK
      await expect(envTypeService.createNewEnvironmentType(createParams)).rejects.toThrow(
        `Unable to create environment type with params: ${JSON.stringify(createParams)}`
      );
    });
  });
});
