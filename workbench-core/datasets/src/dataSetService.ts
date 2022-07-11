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
   *
   * @returns the DataSet object which is stored in the backing datastore.
   */
  public async provisionDataSet(
    datasetName: string,
    storageName: string,
    path: string,
    awsAccountId: string,
    storageProvider: DataSetsStoragePlugin
  ): Promise<DataSet> {
    const locator: string = await storageProvider.createStorage(storageName, path);
    const provisioned: DataSet = {
      name: datasetName,
      storageName: storageName,
      path: path,
      awsAccountId: awsAccountId,
      storageType: storageProvider.getStorageType(),
      location: locator
    };

    return await this._dbProvider.addDataSet(provisioned);
  }

  /**
   * Imports an existing storage location into the solution as a DataSet.
   * @param datasetName - the name of the DataSet to import
   * @param storageName - the name of the storage, for instance, the name of an S3 bucket.
   * @param path - the path to the data within the storage, for instance, an S3 prefix.
   * @param awsAccountId - the 12 digit Id of the AWS account where the dataSet resides.
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} to provide the storage impplementation
   * for a particular platform, account, etc.
   *
   * @returns the DataSet object which is stored in teh backing datastore.
   */
  public async importDataSet(
    datasetName: string,
    storageName: string,
    path: string,
    awsAccountId: string,
    storageProvider: DataSetsStoragePlugin
  ): Promise<DataSet> {
    const locator: string = await storageProvider.importStorage(storageName, path);
    const imported: DataSet = {
      name: datasetName,
      storageName: storageName,
      path: path,
      awsAccountId: awsAccountId,
      storageType: storageProvider.getStorageType(),
      location: locator
    };

    return await this._dbProvider.addDataSet(imported);
  }

  /**
   * Removes a DataSet from the solution however it does not delete the storage.
   * @param dataSetId - the ID of the DataSet to remove.
   */
  public async removeDataSet(dataSetId: string): Promise<void> {
    throw new Error(notImplementedText);
  }

  /**
   * Get the mount configuration string for a DataSet.
   * @param dataSetId - the ID of the DataSet.
   * @param endPointId - the ID of the endpoint to remove.
   *
   * @returns the string needed to mount the Dataset in an external environment.
   */
  public async getDataSetMountString(dataSetId: string, endPointId: string): Promise<string> {
    const targetDS: DataSet = await this.getDataSet(dataSetId);

    if (!_.find(targetDS.externalEndpoints, (ep) => ep === endPointId))
      throw Boom.notFound(`'${endPointId}' not found on DataSet '${dataSetId}'.`);

    const endPoint = await this.getExternalEndPoint(dataSetId, endPointId);
    return this._generateMountString(dataSetId, endPoint.endPointUrl, targetDS.path);
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
   * @param dataSetId - the Id of the DataSet for which details are desired.
   * @returns - the DataSet object associated with that DataSet.
   */
  public async getDataSet(dataSetId: string): Promise<DataSet> {
    return await this._dbProvider.getDataSetMetadata(dataSetId);
  }

  /**
   * Add an external endpoint to a DataSet.
   *
   * @param dataSetId - the name of the DataSet to which the endpoint will be added.
   * @param externalEndpointName - the name of the endpoint to add.
   * @param externalRoleName - a role which will interact with the endpoint.
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} initialized with permissions
   * to modify the target DataSet's underlying storage.
   * @returns a string representation of a JSON object which contains a URL to the storage, the DataSet's name and the storage path.
   */
  public async addDataSetExternalEndpoint(
    dataSetId: string,
    externalEndpointName: string,
    storageProvider: DataSetsStoragePlugin,
    externalRoleName?: string
  ): Promise<string> {
    const targetDS: DataSet = await this.getDataSet(dataSetId);
    console.log('ZZZ: targetDS', targetDS);

    if (_.find(targetDS.externalEndpoints, (ep) => ep === externalEndpointName))
      throw Boom.badRequest(`'${externalEndpointName}' already exists in '${dataSetId}'.`);

    const storageUrl = await storageProvider.addExternalEndpoint(
      targetDS.storageName,
      targetDS.path,
      externalEndpointName,
      targetDS.awsAccountId as string,
      externalRoleName
    );
    console.log('storageURL', storageUrl);

    const endPointParam: ExternalEndpoint = {
      name: externalEndpointName,
      dataSetId: targetDS.id as string,
      dataSetName: targetDS.name,
      path: targetDS.path,
      endPointUrl: storageUrl
    };

    if (externalRoleName) {
      endPointParam.allowedRoles = [externalRoleName];
    }

    console.log('endPointParam', endPointParam);
    const endPoint: ExternalEndpoint = await this._dbProvider.addExternalEndpoint(endPointParam);

    console.log('endpoint', endPoint);
    if (!targetDS.externalEndpoints) targetDS.externalEndpoints = [];

    targetDS.externalEndpoints.push(endPoint.id as string);
    await this._dbProvider.updateDataSet(targetDS);
    return this._generateMountString(endPoint.dataSetName, endPoint.endPointUrl, endPoint.path);
  }

  /**
   * Get the details of an external endpoint.
   * @param dataSetId - the name of the DataSet.
   * @param endPointId - the name of the EndPoint.
   * @returns - the details of the endpoint.
   */
  public async getExternalEndPoint(dataSetId: string, endPointId: string): Promise<ExternalEndpoint> {
    return await this._dbProvider.getDataSetEndPointDetails(dataSetId, endPointId);
  }

  private _generateMountString(dataSetId: string, endPointURL: string, path: string): string {
    return JSON.stringify({
      name: dataSetId,
      bucket: endPointURL,
      prefix: path
    });
  }
}
