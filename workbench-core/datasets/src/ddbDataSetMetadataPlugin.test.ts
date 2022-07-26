/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    return 'sampleDataSetId';
  })
}));

import { AwsService } from '@amzn/workbench-core-base';
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  ServiceInputTypes,
  ServiceOutputTypes,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { fc, itProp } from 'jest-fast-check';
import { DataSet, DdbDataSetMetadataPlugin, ExternalEndpoint } from '.';

describe('DdbDataSetMetadataPlugin', () => {
  const ORIGINAL_ENV = process.env;

  const mockDataSetId = 'sampleDataSetId';
  const mockDataSetName = 'Sample-DataSet';
  const mockDataSetPath = 'sample-s3-prefix';
  const mockAwsAccountId = 'Sample-AWS-Account';
  const mockDataSetStorageType = 'S3';
  const mockDataSetStorageName = 'S3-Bucket';
  const mockEndPointName = 'Sample-Access-Point';
  const mockEndPointRole = 'Sample-Role';
  const mockEndPointUrl = `s3://arn:s3:us-east-1:${mockAwsAccountId}:accesspoint/${mockEndPointName}/${mockDataSetPath}/`;

  let aws: AwsService;
  let plugin: DdbDataSetMetadataPlugin;
  let mockDdb: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_REGION = 'us-east-1';
    aws = new AwsService({ region: 'us-east-1', ddbTableName: 'DataSetsTable' });
    plugin = new DdbDataSetMetadataPlugin(aws, 'DS', 'EP');
    mockDdb = mockClient(DynamoDBClient);
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
            path: { S: mockDataSetPath },
            awsAccountId: { S: mockAwsAccountId },
            storageType: { S: mockDataSetStorageType },
            storageName: { S: mockDataSetStorageName }
          }
        ]
      });

      const response: DataSet[] = await plugin.listDataSets();
      expect(response).toBeDefined();
      expect(response).toHaveLength(1);
      expect(response).toEqual([
        {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName
        }
      ]);
    });
  });

  describe('getDataSetsMetadata', () => {
    it('returns the sample DataSet when it is found in the database.', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType },
          storageName: { S: mockDataSetStorageName }
        }
      });
      const response = await plugin.getDataSetMetadata(mockDataSetId);

      await expect(response).toEqual({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName
      });
    });

    it('throws not found when an undefined DataSet item is returned.', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: undefined
      });
      let response;

      try {
        response = await plugin.getDataSetMetadata(mockDataSetId);
        expect.hasAssertions();
      } catch (err) {
        response = err;
      }

      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual(`Could not find DataSet '${mockDataSetId}'.`);
    });

    it('throws not found when no DB response is returned.', async () => {
      mockDdb.on(GetItemCommand).resolves({});
      let response;

      try {
        response = await plugin.getDataSetMetadata(mockDataSetId);
        expect.hasAssertions();
      } catch (err) {
        response = err;
      }

      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual(`Could not find DataSet '${mockDataSetId}'.`);
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
    it("Adds an 'id' to the created DataSet.", async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      const exampleDS: DataSet = {
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName
      };

      mockDdb.on(QueryCommand).resolves({});

      const newDataSet = await plugin.addDataSet(exampleDS);
      expect(newDataSet).toEqual(exampleDS);
      expect(newDataSet.id).toEqual(mockDataSetId);
    });

    it('Does not create a DataSet with no name.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(QueryCommand).resolves({});

      const exampleDS = {
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType
      };

      // @ts-ignore
      await expect(plugin.addDataSet(exampleDS)).rejects.toThrow(
        "Cannot create the DataSet. A 'name' was not supplied but it is required."
      );
    });

    it('Does not create a DataSet with a duplicate name.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            id: { S: mockDataSetId },
            name: { S: mockDataSetName },
            path: { S: mockDataSetPath },
            awsAccountId: { S: mockAwsAccountId },
            storageType: { S: mockDataSetStorageType },
            storageName: { S: mockDataSetStorageName }
          }
        ]
      });

      const exampleDS = {
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName
      };

      await expect(plugin.addDataSet(exampleDS)).rejects.toThrow(
        `Cannot create the DataSet. A DataSet must have a unique 'name', and  '${mockDataSetName}' already exists. `
      );
    });
  });

  describe('udpateDataSet', () => {
    it('Returns the updated DataSet when complete.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});

      const exampleDS = {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName
      };

      await expect(plugin.updateDataSet(exampleDS)).resolves.toEqual(exampleDS);
    });

    it('adds optional external endpoints.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});

      const exampleDS = {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        externalEndpoints: ['some-endpoint'],
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName
      };

      await expect(plugin.updateDataSet(exampleDS)).resolves.toEqual(exampleDS);
    });
  });

  describe('addExternalEndpoint', () => {
    it("succeeds when endpoint doesn't exist and no id is provided.", async () => {
      const mockCreatedDate = new Date().toISOString();
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType },
          storageName: { S: mockDataSetStorageName }
        }
      });
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(QueryCommand).resolves({});

      const exampleEndpoint: ExternalEndpoint = {
        name: mockEndPointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndPointUrl,
        allowedRoles: [mockEndPointRole],
        createdAt: mockCreatedDate
      };

      await expect(plugin.addExternalEndpoint(exampleEndpoint)).resolves.toEqual({
        id: mockDataSetId,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        endPointUrl: mockEndPointUrl,
        name: mockEndPointName,
        path: mockDataSetPath,
        allowedRoles: [mockEndPointRole],
        createdAt: mockCreatedDate
      });
    });

    it('throws if the endpoint id is already defined.', async () => {
      const exampleEndpoint: ExternalEndpoint = {
        name: mockEndPointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndPointUrl,
        allowedRoles: [mockEndPointRole],
        id: mockEndPointName
      };

      await expect(plugin.addExternalEndpoint(exampleEndpoint)).rejects.toThrow(
        new Error("Cannot create the Endpoint. 'Id' already exists.")
      );
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
          externalEndpoints: { L: [{ S: mockEndPointName }] }
        }
      });
      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            name: { S: mockEndPointName },
            dataSetId: { S: mockDataSetId },
            dataSetName: { S: mockDataSetName },
            path: { S: mockDataSetPath },
            endPointUrl: { S: mockEndPointUrl },
            allowedRoles: { L: [{ S: mockEndPointRole }] },
            id: { S: mockEndPointName }
          }
        ]
      });

      const exampleEndpoint: ExternalEndpoint = {
        name: mockEndPointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndPointUrl,
        allowedRoles: [mockEndPointRole]
      };

      await expect(plugin.addExternalEndpoint(exampleEndpoint)).rejects.toThrow(
        new Error(
          `Cannot create the EndPoint. EndPoint with name '${mockEndPointName}' already exists on DataSet '${mockDataSetName}'.`
        )
      );
    });
  });

  describe('getDataSetEndPointDetails', () => {
    it('throws when an empty response is given.', async () => {
      mockDdb.on(GetItemCommand).resolves({});
      let response;
      try {
        await plugin.getDataSetEndPointDetails(mockDataSetId, mockEndPointName);
        expect.hasAssertions();
      } catch (error) {
        response = error;
      }
      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual(
        `Could not find the endpoint '${mockEndPointName}' on '${mockDataSetId}'.`
      );
    });

    it('throws when an empty item is given.', async () => {
      mockDdb.on(GetItemCommand).resolves({ Item: undefined });
      let response;
      try {
        await plugin.getDataSetEndPointDetails(mockDataSetId, mockEndPointName);
        expect.hasAssertions();
      } catch (error) {
        response = error;
      }
      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual(
        `Could not find the endpoint '${mockEndPointName}' on '${mockDataSetId}'.`
      );
    });

    it('returns the external endpoint from the database.', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          name: { S: mockEndPointName },
          dataSetId: { S: mockDataSetId },
          dataSetName: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          endPointUrl: { S: mockEndPointUrl },
          allowedRoles: { L: [{ S: mockEndPointRole }] }
        }
      });
      await expect(plugin.getDataSetEndPointDetails(mockDataSetId, mockEndPointName)).resolves.toEqual({
        name: mockEndPointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndPointUrl,
        allowedRoles: [mockEndPointRole]
      });
    });
  });
});
