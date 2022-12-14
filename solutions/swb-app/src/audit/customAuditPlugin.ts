import { AuditEntry, BaseAuditPlugin, Metadata } from '@aws/workbench-core-audit';
import { getCurrentInvoke } from '@vendia/serverless-express';

export default class CustomAuditPlugin extends BaseAuditPlugin {
  /**
   * Modifies the audit entry to include recommended values for auditing
   * and prepares the {@link AuditEntry} for output.
   *
   * @param metadata - {@link Metadata}
   * @param auditEntry - {@link AuditEntry}
   */
  public async prepare(metadata: Metadata, auditEntry: AuditEntry): Promise<void> {
    const { context } = getCurrentInvoke();
    auditEntry.awsRequestId = context.awsRequestId;
    auditEntry.logEventType = 'audit';
    auditEntry.statusCode = metadata.statusCode;
    auditEntry.action = metadata.action;
    auditEntry.actor = metadata.actor;
    auditEntry.source = metadata.source;
    auditEntry.body = metadata.body && typeof metadata.body === 'object' ? metadata.body : undefined;
    auditEntry.query = metadata.query && typeof metadata.query === 'object' ? metadata.query : undefined;
    auditEntry.params = metadata.params && typeof metadata.params === 'object' ? metadata.params : undefined;
  }
}
