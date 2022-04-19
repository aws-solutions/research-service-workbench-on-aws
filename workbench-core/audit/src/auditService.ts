import AuditEntry from './auditEntry';
import AuditPlugin from './auditPlugin';
import Metadata from './metadata';

/**
 * An AuditServiceConfig interface that contains the configuration for the AuditService.
 */
interface AuditServiceConfig {
  continueOnError?: boolean;
  auditPlugin: AuditPlugin;
  requiredAuditValues: string[];
}
/**
 * An Audit Service that is responsible for writing audit entries.
 */
export default class AuditService {
  private _auditServiceConfig: AuditServiceConfig;
  /**
   *
   * @param auditPlugin - An {@link AuditPlugin} that can modify and write {@link AuditEntry}.
   * @param continueOnError - An optional flag indicating if the method should continue on error when audit entry
   * does not have all required values.
   * @param requiredAuditValues - A string of values required for auditing.
   */
  public constructor(
    auditPlugin: AuditPlugin,
    continueOnError: boolean = false,
    requiredAuditValues: string[] = ['actor', 'source', 'statusCode', 'body', 'action']
  ) {
    this._auditServiceConfig = { auditPlugin, continueOnError, requiredAuditValues };
  }

  /**
   * Validates if an audit entry has all the required audit values.
   *
   * @param auditEntry - The audit entry that is being checked.
   * @returns A boolean indicating whether the audit entry has all required values.
   */
  public isAuditComplete(auditEntry: AuditEntry): boolean {
    for (const value of this._auditServiceConfig.requiredAuditValues) {
      // nosemgrep
      if (!(auditEntry.hasOwnProperty(value) && auditEntry[`${value}`] !== undefined)) return false;
    }
    return true;
  }

  /**
   * Creates an {@link AuditEntry} that is modified by the {@link AuditPlugin}.
   *
   * @param metadata - {@link Metadata}
   * @param body - The body containing information about the response.
   * @returns The {@link AuditEntry}.
   */
  public async createAuditEntry(metadata: Metadata, body: object): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {};

    auditEntry.body = body;
    auditEntry.statusCode = metadata.statusCode;
    auditEntry.timestamp = Date.now();
    auditEntry.action = metadata.action;
    auditEntry.actor = metadata.actor;
    auditEntry.source = metadata.source;

    await this._auditServiceConfig.auditPlugin.prepare(metadata, auditEntry);

    return auditEntry;
  }

  /**
   * Creates an {@link AuditEntry} and writes it using the {@link AuditPlugin}.
   *
   * @param metadata - {@link Metadata}
   * @param body - The body containing information about the response.
   */
  public async write(metadata: Metadata, body: object): Promise<void> {
    const auditEntry: AuditEntry = await this.createAuditEntry(metadata, body);
    if (!this.isAuditComplete(auditEntry) && !this._auditServiceConfig.continueOnError) {
      throw new Error('Audit Entry is not complete');
    }

    await this._auditServiceConfig.auditPlugin.write(metadata, auditEntry);
  }
}
