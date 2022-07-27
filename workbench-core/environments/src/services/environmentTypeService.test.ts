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
import environmentResourceTypeToKey from '../constants/environmentResourceTypeToKey';
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
    provisioningArtifactId: 'pa-dqwijdnwq12',
    params: [],
    updatedAt: '2022-06-20T18:36:14.358Z',
    sk: `ET#${envTypeId}`,
    owner: 'owner-123',
    description: 'An Amazon SageMaker Jupyter Notebook',
    id: envTypeId,
    pk: `ET#${envTypeId}`,
    productId: 'prod-dwqdqdqdwq',
    type: 'sagemaker'
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
            pk: `${environmentResourceTypeToKey.envType}#${envTypeId}`,
            sk: `${environmentResourceTypeToKey.envType}#${envTypeId}`
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
          KeyConditionExpression: '#resourceType = :resourceType'
        })
        .resolves(queryItemResponse);
      const validPaginationToken =
        'eyJzayI6IkVUIzZjNzMyZTExLTg3ZmItNDBlNy1hZTNiLTI1NTE2NThkNzhmMCIsInJlc291cmNlVHlwZSI6ImVudlR5cGUiLCJwayI6IkVUIzZjNzMyZTExLTg3ZmItNDBlNy1hZTNiLTI1NTE2NThkNzhmMCIsInVwZGF0ZWRBdCI6IjIwMjItMDYtMTZUMjI6NDE6MDUuOTYyWiJ9';

      // OPERATE
      const actualResponse = await envTypeService.listEnvironmentTypes(1, validPaginationToken);

      // CHECK
      expect(actualResponse).toEqual({ data: [envType] });
    });
    test('invalidPaginationToken', async () => {
      // BUILD & OPERATE & CHECK
      await expect(envTypeService.listEnvironmentTypes(1, 'invalidPaginationToken')).rejects.toThrow(
        'Invalid paginationToken'
      );
    });
  });

  describe('updateEnvironmentType', () => {
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
            pk: `${environmentResourceTypeToKey.envType}#${envTypeId}`,
            sk: `${environmentResourceTypeToKey.envType}#${envTypeId}`
          })
        })
        .resolves(getItemResponse);
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
          productId: 'abc',
          provisioningArtifactId: 'xyz'
        })
      ).rejects.toThrow('We do not support updating these attributes productId,provisioningArtifactId');
    });
  });

  describe('createNewEnvironmentType', () => {
    const createParams = {
      status: 'APPROVED',
      name: 'Jupyter Notebook',
      provisioningArtifactId: 'pa-dqwijdnwq12',
      params: [],
      description: 'An Amazon SageMaker Jupyter Notebook',
      productId: 'prod-dwqdqdqdwq',
      type: 'sagemaker'
    };
    test('successfully create envType', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: marshall(envType)
      });

      // OPERATE
      const actualResponse = await envTypeService.createNewEnvironmentType('owner-123', createParams);

      // CHECK
      expect(actualResponse).toEqual(envType);
    });

    test('failed to create envType', async () => {
      // BUILD
      ddbMock.on(UpdateItemCommand).resolves({
        Attributes: undefined
      });

      // OPERATE & CHECK
      await expect(envTypeService.createNewEnvironmentType('owner-123', createParams)).rejects.toThrow(
        `Unable to create environment type with params: ${JSON.stringify(createParams)}`
      );
    });
  });
});
