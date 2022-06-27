jest.mock('@amzn/workbench-core-audit');
jest.mock('@amzn/workbench-core-logging');

import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import { AwsService } from '@amzn/workbench-core-base';
import { LoggingService } from '@amzn/workbench-core-logging';
import { DataSetService, S3DataSetStoragePlugin } from '.';

describe('DataSetService', () => {
  let writer: Writer;
  let audit: AuditService;
  let log: LoggingService;
  let aws: AwsService;
  const notImplementedText: string = 'Not yet implemented.';

  beforeEach(() => {
    writer = {
      prepare: jest.fn(),
      write: jest.fn()
    };
    audit = new AuditService(new BaseAuditPlugin(writer), true);

    log = new LoggingService();
  });

  describe('constructor', () => {
    it('sets a private audit and log service', () => {
      const service = new DataSetService(audit, log);

      expect(service[`_audit`]).toBe(audit);
      expect(service[`_log`]).toBe(log);
    });
  });

  describe('provisionDataset', () => {
    let service: DataSetService;
    let plugin: S3DataSetStoragePlugin;

    beforeEach(() => {
      service = new DataSetService(audit, log);
      aws = new AwsService({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        }
      });
      const kmsKeyArn = 'not an arn!';
      plugin = new S3DataSetStoragePlugin(aws, kmsKeyArn);
    });

    it('throws not implemented when called', async () => {
      await expect(async () => service.provisionDataSet('name', plugin)).rejects.toThrow(
        new Error(notImplementedText)
      );
    });
  });

  describe('importDataset', () => {
    let service: DataSetService;
    let plugin: S3DataSetStoragePlugin;

    beforeEach(() => {
      service = new DataSetService(audit, log);
      aws = new AwsService({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'fakeKey',
          secretAccessKey: 'fakeSecret'
        }
      });
      const kmsKeyArn = 'not an arn!';
      plugin = new S3DataSetStoragePlugin(aws, kmsKeyArn);
    });

    it('throws not implemented when called', async () => {
      await expect(async () => service.importDataSet('name', plugin)).rejects.toThrow(
        new Error(notImplementedText)
      );
    });
  });

  describe('removeDataset', () => {
    let service: DataSetService;

    beforeEach(() => {
      service = new DataSetService(audit, log);
    });

    it('throws not implemented when called', async () => {
      await expect(async () => service.removeDataSet('name')).rejects.toThrow(new Error(notImplementedText));
    });
  });

  describe('getDataSetMountString', () => {
    let service: DataSetService;

    beforeEach(() => {
      service = new DataSetService(audit, log);
    });

    it('throws not implemented when called', async () => {
      await expect(async () => service.getDataSetMountString('name', 'fakeRoleArn')).rejects.toThrow(
        new Error(notImplementedText)
      );
    });
  });
});
