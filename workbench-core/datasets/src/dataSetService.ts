import { AuditService } from '@amzn/workbench-core-audit';
import { DataSetsStoragePlugin } from '.';
import { LoggingService } from '@amzn/workbench-core-logging';

export class DataSetService {
  private audit: AuditService;
  private log: LoggingService;
  private storage: DataSetsStoragePlugin;

  /**
   * Constructs a @{link DataSetService} instance.
   * @param audit - an instance of a @{link AuditService} configured for use by the DataSetService
   * @param log - an instance of a @{link LoggingService} configured for use by the DataSetService
   * @param storage - an instance of a @{link DataSetsStoragePlugin} configured to access DataSets Storage.
   */
  constructor(audit: AuditService, log: LoggingService, storage: DataSetsStoragePlugin) {
    this.audit = audit;
    this.log = log;
    this.storage = storage;
  }
}
