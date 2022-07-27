/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditEntry from './auditEntry';
import AuditPlugin from './auditPlugin';
import AuditService from './auditService';
import Metadata from './metadata';

const sysTime = new Date('2022-01-01').getTime();
jest.useFakeTimers().setSystemTime(sysTime);
describe('Audit Service', () => {
  const statusCode: number = 200;
  const action: string = 'GET /user/sample';
  const actor: object = {
    principalIdentifier: { uid: 'userIdFromContext' }
  };
  const body: object = { data: 'sample data' };
  const source: object = {
    ipAddress: 'sampleIPAddress'
  };
  let mockMetadata: Metadata;
  const mockAuditPlugin: AuditPlugin = {
    write: jest.fn(async (metadata: Metadata, auditEntry: Readonly<AuditEntry>): Promise<void> => {}),
    prepare: jest.fn(async (metadata: Metadata, auditEntry: AuditEntry): Promise<void> => {
      auditEntry.action = metadata.action;
      auditEntry.statusCode = metadata.statusCode;
      auditEntry.source = metadata.source;
      auditEntry.actor = metadata.actor;
    })
  };

  let auditService: AuditService;
  let requiredAuditValues: string[];

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
          }
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

    test('Write Audit Entry', async () => {
      await auditService.write(mockMetadata, body);
      expect(mockAuditPlugin.write).toHaveBeenCalledTimes(1);
      expect(mockAuditPlugin.prepare).toHaveBeenCalledTimes(1);
    });

    test('Fails when source is undefined', async () => {
      mockMetadata.source = undefined;
      try {
        await auditService.write(mockMetadata, body);
        expect.hasAssertions();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        expect(err.message).toBe('Audit Entry is not complete');
      }
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
      try {
        await auditService.write(mockMetadata, body);
        expect.hasAssertions();
      } catch (err) {
        expect(err.message).toBe('Audit Entry is not complete');
      }
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
