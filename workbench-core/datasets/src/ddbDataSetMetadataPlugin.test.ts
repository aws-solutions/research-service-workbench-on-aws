/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    return 'sampleId';
  })
}));

import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  ServiceInputTypes,
  ServiceOutputTypes,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { AwsService, PaginatedResponse } from '@aws/workbench-core-base';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { fc, itProp } from 'jest-fast-check';
import { DdbDataSetMetadataPlugin } from './ddbDataSetMetadataPlugin';
import { DataSetExistsError } from './errors/dataSetExistsError';
import { DataSetNotFoundError } from './errors/dataSetNotFoundError';
import { EndpointExistsError } from './errors/endpointExistsError';
import { EndpointNotFoundError } from './errors/endpointNotFoundError';
import { CreateDataSetMetadata, DataSetMetadata } from './models/dataSetMetadata';
import { DataSetsAccessLevel } from './models/dataSetsAccessLevel';
import { CreateExternalEndpointMetadata, ExternalEndpointMetadata } from './models/externalEndpointMetadata';
import { StorageLocation } from './models/storageLocation';

describe('DdbDataSetMetadataPlugin', () => {
  const ORIGINAL_ENV = process.env;
  const datasetKeyTypeId = 'DS';
  const endpointKeyTypeId = 'EP';

  const mockDataSetId = `${datasetKeyTypeId.toLowerCase()}-sampleId`;
  const mockDataSetName = 'Sample-DataSet';
  const mockDataSetPath = 'sample-s3-prefix';
  const mockAwsAccountId = 'Sample-AWS-Account';
  const mockAwsBucketRegion = 'Sample-AWS-Bucket-Region';
  const mockDataSetStorageType = 'S3';
  const mockDataSetStorageName = 'S3-Bucket';
  const mockDataSetDescription = 'Sample-DataSet-Description';
  const mockDataSetType = 'Sample-DataSet-Type';
  const mockDataSetOwner = 'Sample-DataSet-Owner';
  const mockDataSetRegion = 'Sample-DataSet-Region';
  const mockDataSetResourceType = 'dataset';
  const mockEndpointId = `${endpointKeyTypeId.toLowerCase()}-sampleId`;
  const mockEndpointName = `${endpointKeyTypeId}-Sample-Access-Point`;
  const mockEndpointRole = 'Sample-Role';
  const mockEndpointUrl = `s3://arn:s3:us-east-1:${mockAwsAccountId}:accesspoint/${mockEndpointName}/${mockDataSetPath}/`;
  const mockEndpointAlias = `${mockEndpointName}-s3alias`;
  const mockEndpointResourceType = 'endpoint';
  const mockCreatedAt = 'Sample-Created-At-ISO-String';
  const mockAccessLevel: DataSetsAccessLevel = 'read-only';

  let aws: AwsService;
  let plugin: DdbDataSetMetadataPlugin;
  let mockDdb: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  beforeEach(() => {
    jest.resetModules();
    expect.hasAssertions();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_REGION = 'us-east-1';
    aws = new AwsService({ region: 'us-east-1', ddbTableName: 'DataSetsTable' });
    plugin = new DdbDataSetMetadataPlugin(aws, datasetKeyTypeId, endpointKeyTypeId);
    mockDdb = mockClient(DynamoDBClient);
    jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => mockCreatedAt);
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('listDataSets', () => {
    it('returns a DataSet stored in the Database', async () => {
      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            id: { S: mockDataSetId },
            name: { S: mockDataSetName },
            createdAt: { S: mockCreatedAt },
            path: { S: mockDataSetPath },
            awsAccountId: { S: mockAwsAccountId },
            storageType: { S: mockDataSetStorageType },
            storageName: { S: mockDataSetStorageName },
            resourceType: { S: mockDataSetResourceType }
          }
        ]
      });

      const response = await plugin.listDataSets(1, undefined);
      expect(response).toMatchObject<PaginatedResponse<DataSetMetadata>>({
        data: [
          {
            id: mockDataSetId,
            name: mockDataSetName,
            path: mockDataSetPath,
            awsAccountId: mockAwsAccountId,
            storageType: mockDataSetStorageType,
            storageName: mockDataSetStorageName,
            createdAt: mockCreatedAt
          }
        ],
        paginationToken: undefined
      });
    });

    it('returns an empty array if there are no DataSets to list', async () => {
      mockDdb.on(QueryCommand).resolves({});

      const response: PaginatedResponse<DataSetMetadata> = await plugin.listDataSets(1, undefined);
      expect(response.data).toBeDefined();
      expect(response.data).toHaveLength(0);
      expect(response.data).toStrictEqual([]);
    });
  });

  describe('getDataSetsMetadata', () => {
    it('returns the sample DataSet when it is found in the database.', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          createdAt: { S: mockCreatedAt },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType },
          storageName: { S: mockDataSetStorageName },
          resourceType: { S: mockDataSetResourceType }
        }
      });
      const response = await plugin.getDataSetMetadata(mockDataSetId);

      expect(response).toMatchObject<DataSetMetadata>({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        createdAt: mockCreatedAt
      });
    });

    it('throws DataSetNotFoundError when an undefined DataSet item is returned.', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: undefined
      });

      await expect(plugin.getDataSetMetadata(mockDataSetId)).rejects.toThrow(DataSetNotFoundError);
    });

    it('throws DataSetNotFoundError when no DB response is returned.', async () => {
      mockDdb.on(GetItemCommand).resolves({});

      await expect(plugin.getDataSetMetadata(mockDataSetId)).rejects.toThrow(DataSetNotFoundError);
    });
  });

  describe('listDataSetObjects', () => {
    itProp('throws a not implemented error', [fc.string()], async (dataSetName) => {
      await expect(() => plugin.listDataSetObjects(dataSetName)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('getDataSetObjectMetadata', () => {
    itProp('throws a not implemented error', [fc.string(), fc.string()], async (dataSetName, objectName) => {
      await expect(() => plugin.getDataSetObjectMetadata(dataSetName, objectName)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('addDataSet', () => {
    let exampleDS: CreateDataSetMetadata;

    beforeEach(() => {
      exampleDS = {
        name: mockDataSetName,
        description: mockDataSetDescription,
        owner: mockDataSetOwner,
        type: mockDataSetType,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        region: mockDataSetRegion
      };
    });

    it("Adds an 'id' to the created DataSet.", async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(QueryCommand).resolves({});

      const newDataSet = await plugin.addDataSet(exampleDS);
      expect(newDataSet).toMatchObject<DataSetMetadata>({
        ...exampleDS,
        id: mockDataSetId,
        createdAt: mockCreatedAt
      });
    });

    it('Does not create a DataSet with a duplicate name.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            id: { S: mockDataSetId },
            name: { S: mockDataSetName },
            createdAt: { S: mockCreatedAt },
            path: { S: mockDataSetPath },
            awsAccountId: { S: mockAwsAccountId },
            storageType: { S: mockDataSetStorageType },
            storageName: { S: mockDataSetStorageName },
            resourceType: { S: mockDataSetResourceType }
          }
        ]
      });

      await expect(plugin.addDataSet(exampleDS)).rejects.toThrow(DataSetExistsError);
    });
  });

  describe('updateDataSet', () => {
    let exampleDS: DataSetMetadata;

    beforeEach(() => {
      exampleDS = {
        id: mockDataSetId,
        name: mockDataSetName,
        description: mockDataSetDescription,
        owner: mockDataSetOwner,
        type: mockDataSetType,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        region: mockDataSetRegion,
        createdAt: mockCreatedAt
      };
    });

    it('Returns the updated DataSet when complete.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});

      await expect(plugin.updateDataSet(exampleDS)).resolves.toStrictEqual(exampleDS);
    });

    it('adds optional external endpoints.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});

      const withEndpointDS: DataSetMetadata = {
        ...exampleDS,
        externalEndpoints: ['some-endpoint']
      };

      await expect(plugin.updateDataSet(withEndpointDS)).resolves.toStrictEqual(withEndpointDS);
    });
  });

  describe('removeDataSet', () => {
    it('returns nothing when the dataset is removed.', async () => {
      mockDdb.on(DeleteItemCommand).resolves({});

      await expect(plugin.removeDataSet(mockDataSetId)).resolves.not.toThrow();
      expect(mockDdb.commandCalls(DeleteItemCommand)).toHaveLength(1);
    });
  });

  describe('addExternalEndpoint', () => {
    it("succeeds when endpoint doesn't exist and no id is provided.", async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          createdAt: { S: mockCreatedAt },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType },
          storageName: { S: mockDataSetStorageName },
          resourceType: { S: mockDataSetResourceType }
        }
      });
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(QueryCommand).resolves({});

      const exampleEndpoint: CreateExternalEndpointMetadata = {
        name: mockEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndpointUrl,
        endPointAlias: mockEndpointAlias,
        allowedRoles: [mockEndpointRole],
        accessLevel: mockAccessLevel
      };

      await expect(
        plugin.addExternalEndpoint(exampleEndpoint)
      ).resolves.toMatchObject<ExternalEndpointMetadata>({
        id: mockEndpointId,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        endPointUrl: mockEndpointUrl,
        endPointAlias: mockEndpointAlias,
        name: mockEndpointName,
        path: mockDataSetPath,
        allowedRoles: [mockEndpointRole],
        createdAt: mockCreatedAt,
        accessLevel: mockAccessLevel
      });
    });

    it('throws if the endpoint already exists within the DataSet', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType },
          storageName: { S: mockDataSetStorageName },
          resourceType: { S: mockDataSetResourceType },
          externalEndpoints: { L: [{ S: mockEndpointName }] },
          createdAt: { S: mockCreatedAt },
          accessLevel: { S: mockAccessLevel }
        }
      });
      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            name: { S: mockEndpointName },
            dataSetId: { S: mockDataSetId },
            dataSetName: { S: mockDataSetName },
            path: { S: mockDataSetPath },
            endPointUrl: { S: mockEndpointUrl },
            endPointAlias: { S: mockEndpointAlias },
            allowedRoles: { L: [{ S: mockEndpointRole }] },
            resourceType: { S: mockEndpointResourceType },
            id: { S: mockEndpointName },
            createdAt: { S: mockCreatedAt },
            accessLevel: { S: mockAccessLevel }
          }
        ]
      });

      const exampleEndpoint: CreateExternalEndpointMetadata = {
        name: mockEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndpointUrl,
        endPointAlias: mockEndpointAlias,
        allowedRoles: [mockEndpointRole],
        accessLevel: mockAccessLevel
      };

      await expect(plugin.addExternalEndpoint(exampleEndpoint)).rejects.toThrow(EndpointExistsError);
    });
  });

  describe('getDataSetEndPointDetails', () => {
    it('throws when an empty response is given.', async () => {
      mockDdb.on(GetItemCommand).resolves({});

      await expect(plugin.getDataSetEndPointDetails(mockDataSetId, mockEndpointName)).rejects.toThrow(
        EndpointNotFoundError
      );
    });

    it('throws when an empty item is given.', async () => {
      mockDdb.on(GetItemCommand).resolves({ Item: undefined });

      await expect(plugin.getDataSetEndPointDetails(mockDataSetId, mockEndpointName)).rejects.toThrow(
        EndpointNotFoundError
      );
    });

    it('returns the external endpoint from the database.', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockEndpointId },
          name: { S: mockEndpointName },
          dataSetId: { S: mockDataSetId },
          dataSetName: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          endPointUrl: { S: mockEndpointUrl },
          endPointAlias: { S: mockEndpointAlias },
          allowedRoles: { L: [{ S: mockEndpointRole }] },
          createdAt: { S: mockCreatedAt },
          accessLevel: { S: mockAccessLevel },
          resourceType: { S: mockEndpointResourceType }
        }
      });
      await expect(
        plugin.getDataSetEndPointDetails(mockDataSetId, mockEndpointName)
      ).resolves.toMatchObject<ExternalEndpointMetadata>({
        id: mockEndpointId,
        name: mockEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndpointUrl,
        endPointAlias: mockEndpointAlias,
        allowedRoles: [mockEndpointRole],
        createdAt: mockCreatedAt,
        accessLevel: mockAccessLevel
      });
    });
  });

  describe('listStorageLocations', () => {
    it('returns a list of all StorageLocations stored in the Database', async () => {
      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            id: { S: mockDataSetId },
            name: { S: mockDataSetName },
            path: { S: mockDataSetPath },
            awsAccountId: { S: mockAwsAccountId },
            storageType: { S: mockDataSetStorageType },
            storageName: { S: mockDataSetStorageName },
            resourceType: { S: mockDataSetResourceType },
            region: { S: mockAwsBucketRegion },
            createdAt: { S: mockCreatedAt }
          }
        ]
      });

      const response = await plugin.listStorageLocations(1, undefined);
      expect(response.data).toBeDefined();
      expect(response.data).toHaveLength(1);
      expect(response.data).toMatchObject<StorageLocation[]>([
        {
          name: mockDataSetStorageName,
          awsAccountId: mockAwsAccountId,
          type: mockDataSetStorageType,
          region: mockAwsBucketRegion
        }
      ]);
    });
  });
});
