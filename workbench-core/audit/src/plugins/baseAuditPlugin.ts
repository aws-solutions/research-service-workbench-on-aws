import AuditEntry from '../auditEntry';
import AuditPlugin from '../auditPlugin';
import Metadata from '../metadata';
import Writer from './writer';

/**
 *  This is the base audit plugin that utilizes {@link Writer} to output
 */
class BaseAuditPlugin implements AuditPlugin {
  private _writer: Writer;
  public constructor(writer: Writer) {
    this._writer = writer;
  }
  /**
   * Modifies the audit entry to add audit as the logEventType and prepares the {@link AuditEntry} for output.
   *
   * @param metadata - {@link Metadata}
   * @param auditEntry - {@link AuditEntry}
   */
  public async prepare(metadata: Metadata, auditEntry: AuditEntry): Promise<void> {
    if (!auditEntry.logEventType) {
      auditEntry.logEventType = 'audit';
    }
    if (this._writer.prepare !== undefined) {
      await this._writer.prepare(metadata, auditEntry);
    }
  }
  /**
   * Writes the audit entry using the writer
   *
   * @param metadata - {@link Metadata}
   * @param auditEntry - {@link AuditEntry}
   */
  public async write(metadata: Metadata, auditEntry: AuditEntry): Promise<void> {
    await this._writer.write(metadata, auditEntry);
  }
}

export default BaseAuditPlugin;
