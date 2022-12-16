/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const uuid = '40b01529-0c7f-4609-a1e2-715068da5f0e';
const envTypeConfigId = `etc-${uuid}`;
jest.mock('uuid', () => ({ v4: () => uuid }));
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import * as Boom from '@hapi/boom';
import { mockClient } from 'aws-sdk-client-mock';
import { EnvironmentTypeConfig } from '../models/environmentTypeConfigs/environmentTypeConfig';
import { EnvironmentType } from '../models/environmentTypes/environmentType';

import EnvironmentTypeConfigService from './environmentTypeConfigService';
import EnvironmentTypeService from './environmentTypeService';

describe('environmentTypeConfigService', () => {
  const TABLE_NAME = 'exampleDDBTable';
  const ddbServiceMock = new DynamoDBService({ region: 'us-east-1', table: TABLE_NAME });
  const envTypeMock = new EnvironmentTypeService(ddbServiceMock);
  const envTypeConfigService = new EnvironmentTypeConfigService(envTypeMock, ddbServiceMock);
  const ddbMock = mockClient(DynamoDBClient);
  const envTypeId = '1b0502f3-121f-4d63-b03a-44dc756e4c20';
  const envType: EnvironmentType = {
    status: 'APPROVED',
    createdAt: '2022-06-20T18:32:09.985Z',
    name: 'Jupyter Notebook',
    provisioningArtifactId: 'pa-dqwijdnwq12w2',
    params: {},
    updatedAt: '2022-06-20T18:36:14.358Z',
    description: 'An Amazon SageMaker Jupyter Notebook',
    id: envTypeId,
    productId: 'prod-dwqdqdqdwq2e3',
    type: 'sagemaker'
  };
  const envTypeConfig: EnvironmentTypeConfig = {
    createdAt: '2022-06-17T16:28:40.360Z',
    name: 'config 1',
    params: [],
    updatedAt: '2022-06-17T21:25:24.333Z',
    description: 'Example config 1',
    id: envTypeConfigId,
    type: 'sagemaker'
  };
  const envTypeConfigDDBItem = {
    ...envTypeConfig,
    dependency: envTypeId,
    resourceType: 'envTypeConfig'
  };

  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
    jest.clearAllMocks();
    ddbMock.reset();
  });
  describe('getEnvironmentTypeConfig', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envTypeConfigDDBItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`,
            sk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);

      // CHECK
      expect(actualResponse).toEqual(envTypeConfig);
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
      const envTypeFilterParams = {
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
        Limit: 1
      };
      ddbMock.on(QueryCommand, envTypeFilterParams).resolves(queryItemResponse);
      const validPaginationToken =
        'eyJwayI6IkVUQyIsInNrIjoiRVQjMWIwNTAyZjMtMTIxZi00ZDYzLWIwM2EtNDRkYzc1NmU0YzIwRVRDIzQwYjAxNTI5LTBjN2YtNDYwOS1hMWUyLTcxNTA2OGRhNWYwZSJ9';

      // OPERATE
      const actualResponse = await envTypeConfigService.listEnvironmentTypeConfigs({
        pageSize: 1,
        paginationToken: validPaginationToken,
        envTypeId
      });

      // CHECK
      expect(actualResponse).toEqual({ data: [envTypeConfig] });
    });
    test('invalidPaginationToken', async () => {
      // BUILD & OPERATE & CHECK
      await expect(
        envTypeConfigService.listEnvironmentTypeConfigs({
          pageSize: 1,
          paginationToken: 'invalidPaginationToken',
          envTypeId
        })
      ).rejects.toThrow('Invalid paginationToken');
    });
  });

  describe('updateEnvironmentTypeConfig', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envTypeConfigDDBItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`,
            sk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
          })
        })
        .resolves(getItemResponse);

      ddbMock
        .on(UpdateItemCommand)
        //@ts-ignore
        .resolves({ Attributes: marshall({ ...envTypeConfig, description: 'FakeDescription' }) });

      // OPERATE
      const actualResponse = await envTypeConfigService.updateEnvironmentTypeConfig({
        description: 'FakeDescription',
        envTypeConfigId,
        envTypeId
      });

      // CHECK
      expect(actualResponse).toEqual({ ...envTypeConfig, description: 'FakeDescription' });
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
        envTypeConfigService.updateEnvironmentTypeConfig({
          description: 'FakeDescription',
          envTypeId: invalidEnvTypeId,
          envTypeConfigId: invalidEnvTypeConfigId
        })
      ).rejects.toThrow(
        `Could not find envType ${invalidEnvTypeId} with envTypeConfig ${invalidEnvTypeConfigId} to update`
      );
    });
  });

  describe('createNewEnvironmentTypeConfig', () => {
    const createParams = {
      name: 'config 1',
      resourceType: 'envTypeConfig',
      provisioningArtifactId: 'pa-dewjn123',
      params: [],
      description: 'Example config 1',
      productId: 'prod-dasjk123',
      type: 'sagemaker'
    };
    test('successfully create envTypeConfig', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: marshall(envTypeConfig)
      });
      jest.spyOn(EnvironmentTypeService.prototype, 'getEnvironmentType').mockResolvedValueOnce(envType);
      // OPERATE
      const actualResponse = await envTypeConfigService.createNewEnvironmentTypeConfig({
        envTypeId,
        ...createParams
      });

      // CHECK
      expect(actualResponse).toEqual(envTypeConfig);
    });

    test('failed to create envTypeConfig', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: undefined
      });
      jest.spyOn(EnvironmentTypeService.prototype, 'getEnvironmentType').mockResolvedValueOnce(envType);
      // OPERATE & CHECK
      await expect(
        envTypeConfigService.createNewEnvironmentTypeConfig({ envTypeId, ...createParams })
      ).rejects.toThrow(
        `Unable to create environment type with params: ${JSON.stringify({ envTypeId, ...createParams })}`
      );
    });
  });

  describe('softDeleteEnvironmentTypeConfig', () => {
    test('successfully soft delete envTypeConfig', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envTypeConfigDDBItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`,
            sk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
          })
        })
        .resolves(getItemResponse);

      ddbMock
        .on(UpdateItemCommand)
        //@ts-ignore
        .resolves({ Attributes: marshall({ ...envTypeConfig, resourceType: 'envTypeConfig_delete' }) });

      // OPERATE
      await expect(
        envTypeConfigService.softDeleteEnvironmentTypeConfig(
          {
            envTypeId,
            envTypeConfigId
          },
          (envTypeId: string, envTypeConfigId: string): Promise<void> => {
            return Promise.resolve();
          }
        )
      ).resolves.not.toThrow();
    });

    test('fails to soft delete envTypeConfig with dependencies', async () => {
      // OPERATE
      await expect(
        envTypeConfigService.softDeleteEnvironmentTypeConfig(
          {
            envTypeId,
            envTypeConfigId
          },
          (envTypeId: string, envTypeConfigId: string): Promise<void> => {
            throw Boom.conflict('test dependency error');
          }
        )
      ).rejects.toThrow('test dependency error');
    });
  });
});
