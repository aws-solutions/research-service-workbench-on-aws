import { AuditService } from '@amzn/workbench-core-audit';
import { LoggingService } from '@amzn/workbench-core-logging';
import { DataSetsStoragePlugin } from '.';

const notImplementedText: string = 'Not yet implemented.';

export class DataSetService {
  private _audit: AuditService;
  private _log: LoggingService;

  /**
   * Constructs a {@link DataSetService} instance.
   *
   * @param audit - an instance of a {@link AuditService} configured for use by the DataSetService
   * @param log - an instance of a {@link LoggingService} configured for use by the DataSetService
   *
   * @returns - the intialized {@link DataSetService}.
   */
  public constructor(audit: AuditService, log: LoggingService) {
    this._audit = audit;
    this._log = log;

    return this;
  }

  /**
   * Adds a new DataSet to the current storage.
   * @param datasetName - the name of the DataSet to provision
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} to provide the storage impplementation
   * for a particular platform, account, etc.
   */
  public async provisionDataSet(datasetName: string, storageProvider: DataSetsStoragePlugin): Promise<void> {
    throw new Error(notImplementedText);
  }

  /**
   * Imports an existing storage location into the solution as a DataSet.
   * @param datasetName - the name of the DataSet to import
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} to provide the storage impplementation
   * for a particular platform, account, etc.
   */
  public async importDataSet(datasetName: string, storageProvider: DataSetsStoragePlugin): Promise<void> {
    throw new Error(notImplementedText);
  }

  /**
   * Removes a DataSet from the solution however it does not delete the storage.
   * @param dataSetName - the name of the DataSet to remove.
   */
  public async removeDataSet(dataSetName: string): Promise<void> {
    throw new Error(notImplementedText);
  }

  /**
   * Get the mount configuration string for a DataSet.
   * @param dataSetName - the name of the DataSet.
   * @param environmentRoleArn - an arn with which the DataSet will be accessed from the external environment.
   *
   * @returns the string needed to mount the Dataset in an external environment.
   */
  public async getDataSetMountString(dataSetName: string, environmentRoleArn: string): Promise<string> {
    throw new Error(notImplementedText);
  }
}
