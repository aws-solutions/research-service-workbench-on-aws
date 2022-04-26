import AuditEntry from './auditEntry';
import Metadata from './metadata';

/**
 * The interface class for all Audit Plugins.
 */
export default interface AuditPlugin {
  /**
   * Modifies the audit entry to include necessary values for auditing
   *
   * @param metadata - {@link Metadata}
   * @param auditEntry - {@link AuditEntry}
   */
  prepare(metadata: Metadata, auditEntry: AuditEntry): Promise<void>;

  /**
   * Writes the audit entry to an output source
   *
   * @param metadata - {@link Metadata}
   * @param auditEntry - {@link AuditEntry}
   */
  write(metadata: Metadata, auditEntry: AuditEntry): Promise<void>;
}
