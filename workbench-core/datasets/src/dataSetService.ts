import { AuditService } from '@amzn/workbench-core-audit';
import { DataSetsStoragePlugin } from '.';
import { LoggingService } from '@amzn/workbench-core-logging';

const notImplementedText: string = 'Not yet implemented.';

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

  /**
   * Adds a new DataSet to the current storage.
   * @param datasetName - the name of the DataSet to provision
   * @param additionalParams - storage specific parameters needed to complete the operation.
   */
  async provisionDataSet(datasetName: string, additionalParams: any[]): Promise<void> {
    throw new Error(notImplementedText);
  }

  /**
   * Imports an existing storage location into the solution as a DataSet.
   * @param datasetName - the name of the DataSet to import
   * @param additionalParams - storage specific parameters needed to complete the operation.
   */
  async importDataSet(datasetName: string, additionalParams: any[]): Promise<void> {
    throw new Error(notImplementedText);
  }

  /**
   * Removes a DataSet from the solution however it does not delete the storage.
   * @param dataSetName - the name of the DataSet to remove.
   */
  async removeDataSet(dataSetName: string): Promise<void> {
    throw new Error(notImplementedText);
  }

  /**
   * Get the mount configuration string for a DataSet.
   * @param dataSetName - the name of the DataSet.
   * @param environmentRoleArn - an arn with which the DataSet will be accessed from the external environment.
   * @returns the string needed to mount the Dataset in an external environment.
   */
  async getDataSetMountString(dataSetName: string, environmentRoleArn: string): Promise<void> {
    throw new Error(notImplementedText);
  }
}
