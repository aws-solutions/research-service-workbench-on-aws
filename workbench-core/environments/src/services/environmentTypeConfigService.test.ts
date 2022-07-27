/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const envTypeConfigId = '40b01529-0c7f-4609-a1e2-715068da5f0e';
jest.mock('uuid', () => ({ v4: () => envTypeConfigId }));
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
import environmentResourceTypeToKey from '../constants/environmentResourceTypeToKey';
import EnvironmentTypeConfigService from './environmentTypeConfigService';

describe('environmentTypeConfigService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  const ddbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();
  });
  const TABLE_NAME = 'exampleDDBTable';
  const envTypeConfigService = new EnvironmentTypeConfigService({ TABLE_NAME });
  const envTypeId = '1b0502f3-121f-4d63-b03a-44dc756e4c20';
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
    sk: `${environmentResourceTypeToKey.envType}#${envTypeId}${environmentResourceTypeToKey.envTypeConfig}#${envTypeConfigId}`,
    owner: 'owner-123',
    description: 'Example config 1',
    id: envTypeConfigId,
    pk: 'ETC',
    // productId: 'prod-dasjk123',
    type: 'sagemaker'
  };

  describe('getEnvironmentTypeConfig', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envTypeConfig),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: environmentResourceTypeToKey.envTypeConfig,
            sk: `${environmentResourceTypeToKey.envType}#${envTypeId}${environmentResourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);

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
      await expect(envTypeConfigService.getEnvironmentTypeConfig(invalidId, invalidId)).rejects.toThrow(
        `Could not find environment type config ${invalidId}`
      );
    });
  });

  describe('getEnvironmentTypeConfigs', () => {
    test('validPaginationToken', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: [marshall(envTypeConfig)],
        $metadata: {}
      };

      const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#pk = :pk AND begins_with ( #sk, :sk )',
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk'
        },
        ExpressionAttributeValues: {
          ':pk': {
            S: 'ETC'
          },
          ':sk': {
            S: `ET#${envTypeId}`
          }
        },
        ExclusiveStartKey: {
          pk: {
            S: 'ETC'
          },
          sk: {
            S: `ET#${envTypeId}ETC#${envTypeConfigId}`
          }
        },
        Limit: 1
      };

      ddbMock.on(QueryCommand, params).resolves(queryItemResponse);
      const validPaginationToken =
        'eyJwayI6IkVUQyIsInNrIjoiRVQjMWIwNTAyZjMtMTIxZi00ZDYzLWIwM2EtNDRkYzc1NmU0YzIwRVRDIzQwYjAxNTI5LTBjN2YtNDYwOS1hMWUyLTcxNTA2OGRhNWYwZSJ9';

      // OPERATE
      const actualResponse = await envTypeConfigService.listEnvironmentTypeConfigs(
        envTypeId,
        1,
        validPaginationToken
      );

      // CHECK
      expect(actualResponse).toEqual({ data: [envTypeConfig] });
    });
    test('invalidPaginationToken', async () => {
      // BUILD & OPERATE & CHECK
      await expect(
        envTypeConfigService.listEnvironmentTypeConfigs(envTypeId, 1, 'invalidPaginationToken')
      ).rejects.toThrow('Invalid paginationToken');
    });
  });

  describe('updateEnvironmentTypeConfig', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envTypeConfig),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: environmentResourceTypeToKey.envTypeConfig,
            sk: `${environmentResourceTypeToKey.envType}#${envTypeId}${environmentResourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
          })
        })
        .resolves(getItemResponse);

      ddbMock
        .on(UpdateItemCommand)
        //@ts-ignore
        .resolves({ Attributes: marshall({ ...envTypeConfig, name: 'FakeName' }) });

      // OPERATE
      const actualResponse = await envTypeConfigService.updateEnvironmentTypeConfig(
        'owner-123',
        envTypeId,
        envTypeConfigId,
        { name: 'FakeName' }
      );

      // CHECK
      expect(actualResponse).toEqual({ ...envTypeConfig, name: 'FakeName' });
    });

    test('invalid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock.on(GetItemCommand).resolves(getItemResponse);
      const invalidEnvTypeId = 'invalidEnvTypeId';
      const invalidEnvTypeConfigId = 'invalidEnvTypeConfigId';
      // OPERATE & CHECK
      await expect(
        envTypeConfigService.updateEnvironmentTypeConfig(
          'owner-123',
          invalidEnvTypeId,
          invalidEnvTypeConfigId,
          {
            name: 'FakeName'
          }
        )
      ).rejects.toThrow(
        `Could not find envType ${invalidEnvTypeId} with envTypeConfig ${invalidEnvTypeConfigId} to update`
      );
    });

    test('update attributes that are not allowed', async () => {
      // BUILD & OPERATE & CHECK
      await expect(
        envTypeConfigService.updateEnvironmentTypeConfig('owner-123', envTypeId, envTypeConfigId, {
          productId: 'abc',
          provisioningArtifactId: 'xyz'
        })
      ).rejects.toThrow('We do not support updating these attributes productId,provisioningArtifactId');
    });
  });

  describe('createNewEnvironmentTypeConfig', () => {
    const createParams = {
      name: 'config 1',
      allowRoleIds: [],
      resourceType: 'envTypeConfig',
      provisioningArtifactId: 'pa-dewjn123',
      params: [],
      owner: 'owner-123',
      description: 'Example config 1',
      productId: 'prod-dasjk123',
      type: 'sagemaker'
    };
    test('successfully create envTypeConfig', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: marshall(envTypeConfig)
      });

      // OPERATE
      const actualResponse = await envTypeConfigService.createNewEnvironmentTypeConfig(
        'owner-123',
        envTypeId,
        createParams
      );

      // CHECK
      expect(actualResponse).toEqual(envTypeConfig);
    });

    test('failed to create envTypeConfig', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: undefined
      });

      // OPERATE & CHECK
      await expect(
        envTypeConfigService.createNewEnvironmentTypeConfig('owner-123', envTypeId, createParams)
      ).rejects.toThrow(`Unable to create environment type with params: ${JSON.stringify(createParams)}`);
    });
  });
});
