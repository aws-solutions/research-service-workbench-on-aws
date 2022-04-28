import { AuditEntry, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import { LoggingService } from '@amzn/workbench-core-logging';

export class AuditLogger implements Writer {
  private _logger: LoggingService;
  public constructor(logger: LoggingService) {
    this._logger = logger;
  }
  public async write(metadata: Metadata, auditEntry: AuditEntry): Promise<void> {
    const message = 'Test Message ' + metadata?.statusCode + metadata?.action;
    this._logger.info(message);
  }
}
