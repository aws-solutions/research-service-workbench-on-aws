/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditEntry from './auditEntry';
import AuditPlugin from './auditPlugin';
import AuditService from './auditService';
import { AuditIncompleteError } from './errors/auditIncompleteError';
import Metadata from './metadata';

const sysTime = new Date('2022-01-01').getTime();
jest.useFakeTimers().setSystemTime(sysTime);
describe('Audit Service', () => {
  let statusCode: number;
  let action: string;
  let actor: Record<string, object>;
  let body: Record<string, string>;
  let source: Record<string, string>;
  let mockMetadata: Metadata;
  let mockAuditPlugin: AuditPlugin;

  let auditService: AuditService;
  let requiredAuditValues: string[];

  beforeEach(() => {
    expect.hasAssertions();
    statusCode = 200;
    action = 'GET /user/sample';
    actor = {
      principalIdentifier: { uid: 'userIdFromContext' }
    };

    body = { data: 'sample data' };
    source = {
      ipAddress: 'sampleIPAddress'
    };
    mockAuditPlugin = {
      write: jest.fn(async (metadata: Metadata, auditEntry: Readonly<AuditEntry>): Promise<void> => {}),
      prepare: jest.fn(async (metadata: Metadata, auditEntry: AuditEntry): Promise<void> => {
        auditEntry.action = metadata.action;
        auditEntry.statusCode = metadata.statusCode;
        auditEntry.source = metadata.source;
        auditEntry.actor = metadata.actor;
      })
    };
  });

  describe('Use mockAuditPugin and continues on error', () => {
    beforeEach(() => {
      mockMetadata = {
        action,
        statusCode,
        actor,
        source
      };
      auditService = new AuditService(mockAuditPlugin);
    });

    test('Create Audit Entry', async () => {
      const auditEntry = await auditService.createAuditEntry(mockMetadata, body);
      expect(auditEntry).toStrictEqual({
        body,
        statusCode,
        timestamp: 1640995200000,
        action,
        actor,
        source
      });
      expect(auditService.isAuditComplete(auditEntry)).toBe(true);
      expect(mockAuditPlugin.prepare).toBeCalledWith(mockMetadata, auditEntry);
    });

    test('Create Audit Entry with password exposed in body, should be masked', async () => {
      const exposedBody = {
        info: {
          userInfo: {
            password: 'samplePassword'
          },
          value: undefined
        }
      };
      const auditEntry = await auditService.createAuditEntry(mockMetadata, exposedBody);
      expect(auditEntry).toStrictEqual({
        body: {
          info: {
            userInfo: {
              password: '****'
            }
          }
        },
        statusCode,
        timestamp: 1640995200000,
        action,
        actor,
        source
      });
    });

    test('Create Audit Entry with exposed accessKey in body, should be masked', async () => {
      const exposedBody = {
        info: {
          userInfo: {
            accessKey: 'sampleKey'
          }
        }
      };
      const auditEntry = await auditService.createAuditEntry(mockMetadata, exposedBody);
      expect(auditEntry).toStrictEqual({
        body: {
          info: {
            userInfo: {
              accessKey: '****'
            }
          }
        },
        statusCode,
        timestamp: 1640995200000,
        action,
        actor,
        source
      });
    });

    test('Create Audit Entry with password exposed in metadata', async () => {
      const exposedActor = {
        userInfo: {
          password: 'samplePassword'
        }
      };
      mockMetadata.actor = exposedActor;
      const auditEntry = await auditService.createAuditEntry(mockMetadata, body);

      expect(auditEntry).toStrictEqual({
        body,
        statusCode,
        timestamp: 1640995200000,
        action,
        actor: {
          userInfo: {
            password: '****'
          }
        },
        source
      });
    });
    test('Create Audit Entry when body is an Error', async () => {
      const error = new Error('sampleError');
      const auditEntry = await auditService.createAuditEntry(mockMetadata, error);
      expect(auditEntry).toStrictEqual({
        body: { error: error.name, message: 'sampleError', stack: error.stack },
        statusCode,
        timestamp: 1640995200000,
        action,
        actor,
        source
      });
    });

    test('Write Audit Entry', async () => {
      await auditService.write(mockMetadata, body);
      expect(mockAuditPlugin.write).toHaveBeenCalledTimes(1);
      expect(mockAuditPlugin.prepare).toHaveBeenCalledTimes(1);
    });

    test('Fails when source is undefined', async () => {
      mockMetadata.source = undefined;
      await expect(auditService.write(mockMetadata, body)).rejects.toThrow(AuditIncompleteError);
    });

    test('Continue on error when audit not complete', async () => {
      requiredAuditValues = ['actor', 'statusCode', 'body', 'action'];
      mockMetadata.source = undefined;
      auditService = new AuditService(mockAuditPlugin, true, requiredAuditValues);
      await auditService.write(mockMetadata, body);
      expect(mockAuditPlugin.write).toHaveBeenCalledTimes(1);
      expect(mockAuditPlugin.prepare).toHaveBeenCalledTimes(1);
    });
  });

  describe('Use mockAuditPugin and does not continues on error', () => {
    beforeEach(() => {
      mockMetadata = {
        action,
        statusCode,
        actor,
        source
      };
      requiredAuditValues = ['actor', 'source', 'statusCode', 'body', 'action', 'resourceId'];
      auditService = new AuditService(mockAuditPlugin, false, requiredAuditValues);
    });

    test('Should fail without resourceId, audit entry not complete', async () => {
      await expect(auditService.write(mockMetadata, body)).rejects.toThrow(AuditIncompleteError);
    });

    test('Change plugin to add resourceId', async () => {
      jest
        .spyOn(mockAuditPlugin, 'prepare')
        .mockImplementationOnce(async (metadata: Metadata, auditEntry: AuditEntry): Promise<void> => {
          auditEntry.resourceId = 'sampleResourceId';
          auditEntry.action = metadata.action;
          auditEntry.statusCode = metadata.statusCode;
          auditEntry.source = metadata.source;
          auditEntry.actor = metadata.actor;
        });
      await auditService.write(mockMetadata, body);
      expect(mockAuditPlugin.prepare).toBeCalledTimes(1);
      expect(mockAuditPlugin.write).toBeCalledTimes(1);
    });
  });

  describe('mask fields', () => {
    beforeEach(() => {
      mockMetadata = {
        action,
        statusCode,
        actor,
        source
      };
      requiredAuditValues = ['actor', 'statusCode', 'body', 'action'];
    });

    test('Mask timestamp and statusCode', async () => {
      const maskfields = ['statusCode', 'timestamp'];
      auditService = new AuditService(mockAuditPlugin, false, requiredAuditValues, maskfields);

      const auditEntry = await auditService.createAuditEntry(mockMetadata, body);

      expect(auditEntry).toStrictEqual({
        action,
        statusCode: '****',
        actor,
        timestamp: '****',
        source,
        body
      });
    });
  });
});
