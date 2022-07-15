jest.mock('@amzn/workbench-core-audit');
jest.mock('@amzn/workbench-core-logging');
jest.mock('./dataSetMetadataPlugin');

import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import { AwsService } from '@amzn/workbench-core-base';
import { LoggingService } from '@amzn/workbench-core-logging';
import Boom from '@hapi/boom';
import { DdbDataSetMetadataPlugin } from './ddbDataSetMetadataPlugin';
import { DataSet, DataSetService, S3DataSetStoragePlugin } from '.';

describe('DataSetService', () => {
  let writer: Writer;
  let audit: AuditService;
  let log: LoggingService;
  let aws: AwsService;
  const notImplementedText: string = 'Not yet implemented.';
  let metaPlugin: DdbDataSetMetadataPlugin;

  const mockDataSetId = 'sampleDataSetId';
  const mockDataSetName = 'Sample-DataSet';
  const mockDataSetPath = 'sample-s3-prefix';
  const mockAwsAccountId = 'Sample-AWS-Account';
  const mockDataSetStorageType = 'S3';
  const mockDataSetStorageName = 'S3-Bucket';
  const mockAccessPointName = 'Sample-Access-Point';
  const mockAccessPointAlias = `${mockAccessPointName}-s3alias`;
  const mockRoleArn = 'Sample-Role-Arn';
  const mockAlternateRoleArn = 'Another-Sample-Role-Arn';
  const mockExistingEndpointName = 'Sample-Existing-AP';
  const mockExistingEndpointId = 'Sample-Endpoint-Id';
  const mockDataSetWithEndpointId = 'sampleDataSetWithEndpointId';
  const mockEndPointUrl = `s3://arn:s3:us-east-1:${mockAwsAccountId}:accesspoint/${mockAccessPointName}/${mockDataSetPath}/`;

  beforeEach(() => {
    jest.resetAllMocks();
    writer = {
      prepare: jest.fn(),
      write: jest.fn()
    };
    audit = new AuditService(new BaseAuditPlugin(writer), true);
    aws = new AwsService({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      }
    });
    log = new LoggingService();
    metaPlugin = new DdbDataSetMetadataPlugin(aws, 'DS', 'EP');
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets').mockImplementation(async () => {
      return [
        {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName
        }
      ];
    });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'addDataSet').mockImplementation(async () => {
      return {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName
      };
    });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'updateDataSet').mockImplementation(async () => {
      return {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        externalEndpoints: [mockAccessPointName]
      };
    });
    jest
      .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetMetadata')
      .mockImplementation(async (id: string): Promise<DataSet> => {
        if (id === mockDataSetWithEndpointId) {
          return {
            id: mockDataSetWithEndpointId,
            name: mockDataSetName,
            path: mockDataSetPath,
            awsAccountId: mockAwsAccountId,
            storageType: mockDataSetStorageType,
            storageName: mockDataSetStorageName,
            externalEndpoints: [mockExistingEndpointName]
          };
        }
        return {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName
        };
      });
    jest
      .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetEndPointDetails')
      .mockImplementation(async () => {
        return {
          id: mockExistingEndpointId,
          name: mockExistingEndpointName,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          path: mockDataSetPath,
          endPointUrl: mockEndPointUrl,
          endPointAlias: mockAccessPointAlias,
          allowedRoles: [mockRoleArn]
        };
      });

    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'addExternalEndpoint').mockImplementation(async () => {
      return {
        id: mockExistingEndpointId,
        name: mockExistingEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndPointUrl,
        endPointAlias: mockAccessPointAlias,
        allowedRoles: [mockRoleArn]
      };
    });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'updateExternalEndpoint').mockImplementation(async () => {
      return {
        id: mockExistingEndpointId,
        name: mockExistingEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndPointUrl,
        endPointAlias: mockAccessPointAlias,
        allowedRoles: [mockRoleArn, mockAlternateRoleArn]
      };
    });

    jest.spyOn(S3DataSetStoragePlugin.prototype, 'createStorage').mockImplementation(async () => {
      return `s3://${mockDataSetStorageName}/${mockDataSetPath}/`;
    });
    jest.spyOn(S3DataSetStoragePlugin.prototype, 'addExternalEndpoint').mockImplementation(async () => {
      return {
        endPointUrl: mockEndPointUrl,
        endPointAlias: mockAccessPointAlias
      };
    });
    jest.spyOn(S3DataSetStoragePlugin.prototype, 'importStorage').mockImplementation(async () => {
      return `s3://${mockDataSetStorageName}/${mockDataSetPath}/`;
    });
    jest
      .spyOn(S3DataSetStoragePlugin.prototype, 'addRoleToExternalEndpoint')
      .mockImplementation(async () => {});
  });

  describe('constructor', () => {
    it('sets a private audit and log service', () => {
      const service = new DataSetService(audit, log, metaPlugin);

      expect(service[`_audit`]).toBe(audit);
      expect(service[`_log`]).toBe(log);
    });
  });

  describe('provisionDataset', () => {
    let service: DataSetService;
    let plugin: S3DataSetStoragePlugin;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
      plugin = new S3DataSetStoragePlugin(aws);
    });

    it('calls createStorage and addDataSet', async () => {
      await expect(
        service.provisionDataSet(
          mockDataSetName,
          mockDataSetStorageName,
          mockDataSetPath,
          mockAwsAccountId,
          plugin
        )
      ).resolves.toEqual({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType
      });
      expect(metaPlugin.addDataSet).toBeCalledTimes(1);
      expect(plugin.createStorage).toBeCalledTimes(1);
    });
  });

  describe('importDataset', () => {
    let service: DataSetService;
    let plugin: S3DataSetStoragePlugin;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
      plugin = new S3DataSetStoragePlugin(aws);
    });

    it('calls importStorage and addDataSet ', async () => {
      await expect(
        service.importDataSet('name', 'storageName', 'path', 'accountId', plugin)
      ).resolves.toEqual({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType
      });
      expect(metaPlugin.addDataSet).toBeCalledTimes(1);
      expect(plugin.importStorage).toBeCalledTimes(1);
    });
  });

  describe('removeDataset', () => {
    let service: DataSetService;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
    });

    it('throws not implemented when called', async () => {
      await expect(service.removeDataSet('name')).rejects.toThrow(new Error(notImplementedText));
    });
  });

  describe('getDataSetMountString', () => {
    let service: DataSetService;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
    });

    it("throws when called with a name that doesn't exists.", async () => {
      await expect(service.getDataSetMountObject('name', 'endPointName')).rejects.toThrow(
        new Error(`'endPointName' not found on DataSet 'name'.`)
      );
    });
  });

  describe('listDataSets', () => {
    let service: DataSetService;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
    });

    it('returns an array of known DataSets.', async () => {
      await expect(service.listDataSets()).resolves.toEqual([
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

  describe('getDataSet', () => {
    let service: DataSetService;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
    });

    it('returns a the details of a DataSet.', async () => {
      await expect(service.getDataSet(mockDataSetName)).resolves.toEqual({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName
      });
    });
  });

  describe('addDataSetExternalEndpoint', () => {
    let service: DataSetService;
    let plugin: S3DataSetStoragePlugin;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
      plugin = new S3DataSetStoragePlugin(aws);
    });

    it('returns the mount string for the DataSet mount point', async () => {
      await expect(
        service.addDataSetExternalEndpoint(mockDataSetId, mockAccessPointName, plugin, mockRoleArn)
      ).resolves.toEqual(
        JSON.stringify({
          name: mockDataSetName,
          bucket: mockAccessPointAlias,
          prefix: mockDataSetPath
        })
      );
    });

    it('throws if the external endpoint already exists.', async () => {
      let response;

      try {
        response = await service.addDataSetExternalEndpoint(
          mockDataSetWithEndpointId,
          mockExistingEndpointName,
          plugin,
          mockRoleArn
        );
        expect.hasAssertions();
      } catch (err) {
        response = err;
      }
      expect(Boom.isBoom(response, 400)).toBe(true);
      expect(response.message).toEqual(
        `'${mockExistingEndpointName}' already exists in '${mockDataSetWithEndpointId}'.`
      );
    });
  });

  describe('addRoleToExternalEndpoint', () => {
    let service: DataSetService;
    let plugin: S3DataSetStoragePlugin;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
      plugin = new S3DataSetStoragePlugin(aws);
    });

    it('no-op if the role has already been added to the endpoint.', async () => {
      await expect(
        service.addRoleToExternalEndpoint(mockDataSetId, mockExistingEndpointId, mockRoleArn, plugin)
      ).not.toThrow();
    });

    it('completes if given an unknown role arn.', async () => {
      await expect(
        service.addRoleToExternalEndpoint(mockDataSetId, mockExistingEndpointId, mockAlternateRoleArn, plugin)
      ).resolves.toBeUndefined();
    });
  });
});
