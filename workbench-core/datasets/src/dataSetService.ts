import { AuditService } from '@amzn/workbench-core-audit';
import { LoggingService } from '@amzn/workbench-core-logging';
import Boom from '@hapi/boom';
import _ from 'lodash';
import { DataSet, DataSetMetadataPlugin, DataSetsStoragePlugin, ExternalEndpoint } from '.';

const notImplementedText: string = 'Not yet implemented.';

export class DataSetService {
  private _audit: AuditService;
  private _log: LoggingService;
  private _dbProvider: DataSetMetadataPlugin;
  /**
   * Constructs a {@link DataSetService} instance.
   *
   * @param audit - an instance of a {@link AuditService} configured for use by the DataSetService
   * @param log - an instance of a {@link LoggingService} configured for use by the DataSetService
   * @param masterDbProvider - an instance of {@link DataSetMetadataPlugin} configured for the solution's
   * main account. This plugin will reference the table which will track all DataSets even if some file
   * metadata resides in external accounts.
   * @returns - the intialized {@link DataSetService}.
   */
  public constructor(audit: AuditService, log: LoggingService, masterDbProvider: DataSetMetadataPlugin) {
    this._audit = audit;
    this._log = log;
    this._dbProvider = masterDbProvider;
  }

  /**
   * Adds a new DataSet to the provided storage.
   * @param datasetName - the name of the DataSet to provision.
   * @param storageName - the name of the storage, for instance, the name of an S3 bucket.
   * @param path - the path to the DataSet within the storage.
   * @param awsAccountId - the AWS account where the DataSet resides.
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} to provide the storage impplementation
   * for a particular platform, account, etc.
   */
  public async provisionDataSet(
    datasetName: string,
    storageName: string,
    path: string,
    awsAccountId: string,
    storageProvider: DataSetsStoragePlugin
  ): Promise<void> {
    const locator: string = await storageProvider.createStorage(storageName, path);
    const provisioned: DataSet = {
      name: datasetName,
      storageName: storageName,
      path: path,
      awsAccountId: awsAccountId,
      storageType: storageProvider.getStorageType(),
      location: locator
    };

    await this._dbProvider.addDataSet(provisioned);
  }

  /**
   * Imports an existing storage location into the solution as a DataSet.
   * @param datasetName - the name of the DataSet to import
   * @param storageName - the name of the storage, for instance, the name of an S3 bucket.
   * @param path - the path to the data within the storage, for instance, an S3 prefix.
   * @param awsAccountId - the 12 digit Id of the AWS account where the dataSet resides.
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} to provide the storage impplementation
   * for a particular platform, account, etc.
   */
  public async importDataSet(
    datasetName: string,
    storageName: string,
    path: string,
    awsAccountId: string,
    storageProvider: DataSetsStoragePlugin
  ): Promise<void> {
    const locator: string = await storageProvider.importStorage(storageName, path);
    const imported: DataSet = {
      name: datasetName,
      storageName: storageName,
      path: path,
      awsAccountId: awsAccountId,
      storageType: storageProvider.getStorageType(),
      location: locator
    };

    await this._dbProvider.addDataSet(imported);
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
   * @param endPointName - an arn with which the DataSet will be accessed from the external environment.
   *
   * @returns the string needed to mount the Dataset in an external environment.
   */
  public async getDataSetMountString(dataSetName: string, endPointName: string): Promise<string> {
    const targetDS: DataSet = await this.getDataSet(dataSetName);

    if (!_.find(targetDS.externalEndpoints, (ep) => ep === endPointName))
      throw Boom.notFound(`'${endPointName}' not found on DataSet '${dataSetName}'.`);

    const endPoint = await this.getExternalEndPoint(dataSetName, endPointName);
    return this._generateMountString(dataSetName, endPoint.endPointUrl, targetDS.path);
  }

  /**
   * List the currently known DataSets.
   *
   * @returns an array of DataSet objects.
   */
  public async listDataSets(): Promise<DataSet[]> {
    return await this._dbProvider.listDataSets();
  }

  /**
   * Get details on a particular DataSet.
   *
   * @param dataSetName - the name of the DataSet for which details are desired.
   * @returns - the DataSet object associated with that DataSet.
   */
  public async getDataSet(dataSetName: string): Promise<DataSet> {
    return await this._dbProvider.getDataSetMetadata(dataSetName);
  }

  /**
   * Add an external endpoint to a DataSet.
   *
   * @param dataSetName - the name of the DataSet to which the endpoint will be added.
   * @param externalEndpointName - the name of the endpoint to add.
   * @param externalRoleName - a role which will interact with the endpoint.
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} initialized with permissions
   * to modify the target DataSet's underlying storage.
   * @returns a JSON object which contains a URL to the storage, the DataSet's name and the storage path.
   */
  public async addDataSetExternalEndpoint(
    dataSetName: string,
    externalEndpointName: string,
    externalRoleName: string,
    storageProvider: DataSetsStoragePlugin
  ): Promise<string> {
    const targetDS: DataSet = await this.getDataSet(dataSetName);

    if (_.find(targetDS.externalEndpoints, (ep) => ep === externalEndpointName))
      throw Boom.badRequest(`'${externalEndpointName}' already exists in '${dataSetName}'.`);

    const mountString = await storageProvider.addExternalEndpoint(
      targetDS.storageName,
      targetDS.path,
      externalEndpointName,
      externalRoleName
    );

    if (!targetDS.externalEndpoints) targetDS.externalEndpoints = [];

    targetDS.externalEndpoints.push(externalEndpointName);
    await this._dbProvider.updateDataSet(targetDS);
    return mountString;
  }

  /**
   * Get the details of an external endpoint.
   * @param dataSetName - the name of the DataSet.
   * @param endPointName - the name of the EndPoint.
   * @returns - the details of the endpoint.
   */
  public async getExternalEndPoint(dataSetName: string, endPointName: string): Promise<ExternalEndpoint> {
    return await this._dbProvider.getDataSetEndPointDetails(dataSetName, endPointName);
  }

  private _generateMountString(dataSetName: string, endPointURL: string, path: string): string {
    return JSON.stringify({
      name: dataSetName,
      bucket: endPointURL,
      prefix: path
    });
  }
}
