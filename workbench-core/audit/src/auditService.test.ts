import AuditEntry from './auditEntry';
import AuditPlugin from './auditPlugin';
import AuditService from './auditService';
import Metadata from './metadata';

const sysTime = new Date('2022-01-01').getTime();
jest.useFakeTimers().setSystemTime(sysTime);
describe('Audit Service', () => {
  let auditService: AuditService;
  let body: object;
  let action: string;
  let statusCode: number;
  let mockMetadata: Metadata;
  let actor: object;
  let source: object;
  let mockAuditPlugin: AuditPlugin;
  let requiredAuditValues: string[];
  describe('Use mockAuditPugin and continues on error', () => {
    beforeEach(() => {
      actor = {
        principalIdentifier: { uid: 'userIdFromContext' }
      };
      source = {
        ipAddress: 'sampleIPAddress'
      };
      body = { data: 'sample data' };
      action = 'GET /user/sample';
      statusCode = 200;
      mockMetadata = {
        action,
        statusCode,
        actor,
        source
      };
      mockAuditPlugin = {
        write: jest.fn(),
        prepare: jest.fn()
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
      actor = {
        principalIdentifier: { uid: 'userIdFromContext' }
      };
      source = {
        ipAddress: 'sampleIPAddress'
      };
      body = { data: 'sample data' };
      action = 'GET /user/sample';
      statusCode = 200;
      mockMetadata = {
        action,
        statusCode,
        actor,
        source
      };
      mockAuditPlugin = {
        write: jest.fn(),
        prepare: jest.fn()
      };
      requiredAuditValues = ['actor', 'source', 'statusCode', 'body', 'action', 'resourceId'];
      auditService = new AuditService(mockAuditPlugin, false, requiredAuditValues);
    });

    test('Should fail without resourceId, audit entry not complete', async () => {
      try {
        await auditService.write(mockMetadata, body);
        expect.hasAssertions();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        expect(err.message).toBe('Audit Entry is not complete');
      }
    });

    test('Change plugin to add resourceId', async () => {
      mockAuditPlugin.prepare = jest.fn(async (metadata: Metadata, auditEntry: AuditEntry): Promise<void> => {
        if (!auditEntry.resourceId) {
          auditEntry.resourceId = 'sampleResourceId';
        }
      });
      await auditService.write(mockMetadata, body);
      expect(mockAuditPlugin.prepare).toBeCalledTimes(1);
      expect(mockAuditPlugin.write).toBeCalledTimes(1);
    });
  });
});
