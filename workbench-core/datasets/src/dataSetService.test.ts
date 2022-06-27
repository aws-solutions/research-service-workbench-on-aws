jest.mock('@amzn/workbench-core-audit');
jest.mock('@amzn/workbench-core-logging');

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

  beforeEach(() => {
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
    metaPlugin = new DdbDataSetMetadataPlugin(aws, 'DS', 'endpointKeyId');
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

    it('throws not implemented when called', async () => {
      await expect(async () =>
        service.provisionDataSet('name', 'storageName', 'path', 'accountId', plugin)
      ).rejects.toThrow(new Error(notImplementedText));
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
      await expect(async () =>
        service.provisionDataSet('name', 'storageName', 'path', 'accountId', plugin)
      ).rejects.toThrow(new Error(notImplementedText));
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
