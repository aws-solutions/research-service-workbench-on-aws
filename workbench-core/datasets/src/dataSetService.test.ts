jest.mock('@amzn/workbench-core-audit');
jest.mock('@amzn/workbench-core-logging');
jest.mock('./dataSetMetadataPlugin');

import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import { AwsService } from '@amzn/workbench-core-base';
import { LoggingService } from '@amzn/workbench-core-logging';
import { DdbDataSetMetadataPlugin } from './ddbDataSetMetadataPlugin';
import { DataSetService, S3DataSetStoragePlugin } from '.';

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

    jest.spyOn(S3DataSetStoragePlugin.prototype, 'createStorage').mockImplementation(async () => {
      return `s3://${mockDataSetStorageName}/${mockDataSetPath}/`;
    });
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
      const kmsKeyArn = 'not an arn!';
      plugin = new S3DataSetStoragePlugin(aws, kmsKeyArn);
    });

    it('returns the S3 URL to the new DataSet', async () => {
      await expect(
        service.provisionDataSet(
          mockDataSetName,
          mockDataSetStorageName,
          mockDataSetPath,
          mockAwsAccountId,
          plugin
        )
      ).resolves.toBeUndefined();
      expect(metaPlugin.addDataSet).toBeCalledTimes(1);
      expect(plugin.createStorage).toBeCalledTimes(1);
    });
  });

  describe('importDataset', () => {
    let service: DataSetService;
    let plugin: S3DataSetStoragePlugin;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
      const kmsKeyArn = 'not an arn!';
      plugin = new S3DataSetStoragePlugin(aws, kmsKeyArn);
    });

    it('throws not implemented when called', async () => {
      await expect(
        service.importDataSet('name', 'storageName', 'path', 'accountId', plugin)
      ).resolves.toBeUndefined();
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
      await expect(async () => service.removeDataSet('name')).rejects.toThrow(new Error(notImplementedText));
    });
  });

  describe('getDataSetMountString', () => {
    let service: DataSetService;

    beforeEach(() => {
      service = new DataSetService(audit, log, metaPlugin);
    });

    it('throws not implemented when called', async () => {
      await expect(async () => service.getDataSetMountString('name', 'fakeRoleArn')).rejects.toThrow(
        new Error(notImplementedText)
      );
    });
  });
});
