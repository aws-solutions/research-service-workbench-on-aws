jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    return 'sampleDataSetId';
  })
}));
// const mockUuid = require('uuid') as { v4: jest.Mock<string, []> };

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
import { DataSet, DdbDataSetMetadataPlugin } from '.';

describe('DdbDataSetMetadataPlugin', () => {
  const ORIGINAL_ENV = process.env;

  const mockDataSetId = 'sampleDataSetId';
  const mockDataSetName = 'Sample-DataSet';
  const mockDataSetPath = 'sample-s3-prefix';
  const mockAwsAccountId = 'Sample-AWS-Account';
  const mockDataSetStorageType = 'S3';

  let aws: AwsService;
  let plugin: DdbDataSetMetadataPlugin;
  let mockDdb: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_REGION = 'us-east-1';
    // mockUuid.v4.mockImplementationOnce(() => 'sampleDataSetId');
    aws = new AwsService({ region: 'us-east-1', ddbTableName: 'DataSetsTable' });
    plugin = new DdbDataSetMetadataPlugin(aws, 'DS');
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
            storageType: { S: mockDataSetStorageType }
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
          storageType: mockDataSetStorageType
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
          storageType: { S: mockDataSetStorageType }
        }
      });
      const response = await plugin.getDataSetMetadata('Sample-DataSet');

      await expect(response).toEqual({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType
      });
    });

    it('throws not found when an undefined DataSet item is returned.', async () => {
      mockDdb.on(GetItemCommand).resolves({
        Item: undefined
      });
      let response;

      try {
        response = await plugin.getDataSetMetadata(mockDataSetName);
        expect.hasAssertions();
      } catch (err) {
        response = err;
      }

      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual(`Could not find DataSet '${mockDataSetName}'.`);
    });

    it('throws not found when no DB response is returned.', async () => {
      mockDdb.on(GetItemCommand).resolves({});
      let response;

      try {
        response = await plugin.getDataSetMetadata(mockDataSetName);
        expect.hasAssertions();
      } catch (err) {
        response = err;
      }

      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual(`Could not find DataSet '${mockDataSetName}'.`);
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
        storageType: mockDataSetStorageType
      };

      mockDdb.on(GetItemCommand).resolves({});

      const newDataSet = await plugin.addDataSet(exampleDS);
      expect(newDataSet).toEqual(exampleDS);
      expect(newDataSet.id).toEqual(mockDataSetId);
    });

    it('Does not create a DataSet with no name.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(GetItemCommand).resolves({});

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
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType }
        }
      });

      const exampleDS = {
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType
      };

      await expect(plugin.addDataSet(exampleDS)).rejects.toThrow(
        `Cannot create the DataSet. A DataSet must have a unique 'name', and  '${mockDataSetName}' already exists. `
      );
    });
  });

  describe('udpateDataSet', () => {
    it('Returns the updated DataSet when complete.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType }
        }
      });

      const exampleDS = {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType
      };

      await expect(plugin.updateDataSet(exampleDS)).resolves.toEqual(exampleDS);
    });
  });
  describe('udpateDataSet', () => {
    it('adds optional external endpoints.', async () => {
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: mockDataSetId },
          name: { S: mockDataSetName },
          path: { S: mockDataSetPath },
          awsAccountId: { S: mockAwsAccountId },
          storageType: { S: mockDataSetStorageType }
        }
      });

      const exampleDS = {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        externalEndpoints: ['some-endpoint'],
        storageType: mockDataSetStorageType
      };

      await expect(plugin.updateDataSet(exampleDS)).resolves.toEqual(exampleDS);
    });
  });
});
