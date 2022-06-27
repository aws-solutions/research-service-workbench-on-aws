jest.mock('uuid', () => ({
  v4: jest.fn()
}));
const mockUuid = require('uuid') as { v4: jest.Mock<string, []> };

import { DynamoDBClient, GetItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import { mockClient } from 'aws-sdk-client-mock';
import { fc, itProp } from 'jest-fast-check';
import { DataSet, DdbDataSetMetadataPlugin } from '.';

describe('DdbDataSetMetadataPlugin', () => {
  const ORIGINAL_ENV = process.env;
  let plugin: DdbDataSetMetadataPlugin;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_REGION = 'us-east-1';
    mockUuid.v4.mockImplementationOnce(() => 'sampleDataSetId');
    plugin = new DdbDataSetMetadataPlugin(
      { region: 'us-east-1', ddbTableName: 'DataSetsTable' },
      'DS',
      'endpointKeyId'
    );
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('listDataSets', () => {
    it('returns a DataSet stored in the Database', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(QueryCommand).resolves({
        Items: [
          {
            id: { S: 'sampleDataSetId' },
            name: { S: 'Sample-DataSet' },
            path: { S: 'sample-s3-prefix' },
            awsAccountId: { S: 'Sample-AWS-Account' },
            storageType: { S: 'S3' }
          }
        ]
      });

      const response: DataSet[] = await plugin.listDataSets();
      expect(response).toBeDefined();
      expect(response).toHaveLength(1);
      expect(response).toEqual([
        {
          id: 'sampleDataSetId',
          name: 'Sample-DataSet',
          path: 'sample-s3-prefix',
          awsAccountId: 'Sample-AWS-Account',
          storageType: 'S3'
        }
      ]);
    });
  });

  describe('getDataSetsMetadata', () => {
    it('returns the sample DataSet when it is found in the database.', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: 'sampleDataSetId' },
          name: { S: 'Sample-DataSet' },
          path: { S: 'sample-s3-prefix' },
          awsAccountId: { S: 'Sample-AWS-Account' },
          storageType: { S: 'S3' }
        }
      });
      const response = await plugin.getDataSetMetadata('Sample-DataSet');

      await expect(response).toEqual({
        id: 'sampleDataSetId',
        name: 'Sample-DataSet',
        path: 'sample-s3-prefix',
        awsAccountId: 'Sample-AWS-Account',
        storageType: 'S3'
      });
    });

    it('throws not found when an undefined DataSet item is returned.', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(GetItemCommand).resolves({
        Item: undefined
      });
      let response;

      try {
        response = await plugin.getDataSetMetadata('Sample-DataSet');
      } catch (err) {
        response = err;
      }

      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual("Could not find DataSet 'Sample-DataSet'.");
    });

    it('throws not found when no DB response is returned.', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(GetItemCommand).resolves({});
      let response;

      try {
        response = await plugin.getDataSetMetadata('Sample-DataSet');
      } catch (err) {
        response = err;
      }

      expect(Boom.isBoom(response, 404)).toBe(true);
      expect(response.message).toEqual("Could not find DataSet 'Sample-DataSet'.");
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
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(UpdateItemCommand).resolves({});
      const exampleDS: DataSet = {
        name: 'Sample-DataSet',
        path: 'sample-s3-prefix',
        awsAccountId: 'Sample-AWS-Account',
        storageType: 'S3',
        storageName: 's3 buck'
      };

      mockDdb.on(GetItemCommand).resolves({});

      const newDataSet = await plugin.addDataSet(exampleDS);
      expect(newDataSet).toEqual(exampleDS);
      expect(newDataSet.id).toEqual('sampleDataSetId');
    });

    it('Does not create a DataSet with no name.', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(GetItemCommand).resolves({});

      const exampleDS = {
        path: 'sample-s3-prefix',
        awsAccountId: 'Sample-AWS-Account',
        storageType: 'S3'
      };

      // @ts-ignore
      await expect(plugin.addDataSet(exampleDS)).rejects.toThrow(
        "Cannot create the DataSet. A 'name' was not supplied but it is required."
      );
    });

    it('Does not create a DataSet with a duplicate name.', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: 'sampleDataSetId' },
          name: { S: 'Sample-DataSet' },
          path: { S: 'sample-s3-prefix' },
          awsAccountId: { S: 'Sample-AWS-Account' },
          storageType: { S: 'S3' }
        }
      });

      const exampleDS: DataSet = {
        name: 'Sample-DataSet',
        path: 'sample-s3-prefix',
        awsAccountId: 'Sample-AWS-Account',
        storageType: 'S3',
        storageName: 's3 buck'
      };

      await expect(plugin.addDataSet(exampleDS)).rejects.toThrow(
        "Cannot create the DataSet. A DataSet must have a unique 'name', and  'Sample-DataSet' already exists. "
      );
    });
  });

  describe('udpateDataSet', () => {
    it('Returns the updated DataSet when complete.', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: 'sampleDataSetId' },
          name: { S: 'Sample-DataSet' },
          path: { S: 'sample-s3-prefix' },
          awsAccountId: { S: 'Sample-AWS-Account' },
          storageType: { S: 'S3' }
        }
      });

      const exampleDS: DataSet = {
        id: 'sampleDataSet',
        name: 'Sample-DataSet',
        path: 'sample-s3-prefix',
        awsAccountId: 'Sample-AWS-Account',
        storageType: 'S3',
        storageName: 's3 buck'
      };

      await expect(plugin.updateDataSet(exampleDS)).resolves.toEqual(exampleDS);
    });
  });
  describe('udpateDataSet', () => {
    it('adds optional external endpoints.', async () => {
      const mockDdb = mockClient(DynamoDBClient);
      mockDdb.on(UpdateItemCommand).resolves({});
      mockDdb.on(GetItemCommand).resolves({
        Item: {
          id: { S: 'sampleDataSetId' },
          name: { S: 'Sample-DataSet' },
          path: { S: 'sample-s3-prefix' },
          awsAccountId: { S: 'Sample-AWS-Account' },
          storageType: { S: 'S3' }
        }
      });

      const exampleDS: DataSet = {
        id: 'sampleDataSet',
        name: 'Sample-DataSet',
        path: 'sample-s3-prefix',
        awsAccountId: 'Sample-AWS-Account',
        externalEndpoints: ['some-endpoint'],
        storageType: 'S3',
        storageName: 's3 buck'
      };

      await expect(plugin.updateDataSet(exampleDS)).resolves.toEqual(exampleDS);
    });
  });
});
