import { AuditEntry, Writer } from '@aws/workbench-core-audit';
// import { LoggingService, LogMessageMeta } from '@aws/workbench-core-logging';

export default class CustomAuditLogger implements Writer {
  // private _logger: LoggingService;
  // public constructor(logger: LoggingService) {
  //   this._logger = logger;
  // }
  //
  // public async write(metadata: unknown, auditEntry: AuditEntry): Promise<void> {
  //   this._logger.info(auditEntry as LogMessageMeta);
  // }

  public async write(metadata: unknown, auditEntry: AuditEntry): Promise<void> {
    const updatedAuditEntry = { ...auditEntry };
    delete updatedAuditEntry.statusCode;
    console.log(updatedAuditEntry);
  }
}
