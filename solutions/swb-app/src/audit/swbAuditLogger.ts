import { AuditEntry, Writer } from '@aws/workbench-core-audit';

export default class SwbAuditLogger implements Writer {
  public async write(metadata: unknown, auditEntry: AuditEntry): Promise<void> {
    const updatedAuditEntry = { ...auditEntry };
    delete updatedAuditEntry.statusCode;
    console.log(updatedAuditEntry);
  }
}
