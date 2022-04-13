import AuditEntry from '../auditEntry';
import Metadata from '../metadata';
import BaseAuditPlugin from './baseAuditPlugin';
import Writer from './writer';

describe('BaseAuditPlugin', () => {
  let auditEntry: AuditEntry;
  let writer: Writer;
  let metadata: Metadata;
  let baseAuditPlugin: BaseAuditPlugin;
  beforeEach(async () => {
    auditEntry = {};
    metadata = {};
    writer = {
      write: jest.fn(),
      prepare: jest.fn()
    };
    baseAuditPlugin = new BaseAuditPlugin(writer);
  });
  describe('.prepare', () => {
    test('Prepare audit entry', async () => {
      await baseAuditPlugin.prepare(metadata, auditEntry);
      expect(auditEntry.logEventType).toBe('audit');
    });
  });

  describe('.write', () => {
    test('Write audit entry to output', async () => {
      await baseAuditPlugin.write(metadata, auditEntry);
      expect(writer.write).toHaveBeenCalledWith(metadata, auditEntry);
    });
  });
});
