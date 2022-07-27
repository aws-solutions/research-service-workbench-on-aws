/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService } from '@amzn/workbench-core-audit';
import { LoggingService } from '@amzn/workbench-core-logging';
import Boom from '@hapi/boom';
import _ from 'lodash';
import { EndpointConnectionStrings } from './dataSetsStoragePlugin';
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
    await storageProvider.createStorage(storageName, path);
    const provisioned: DataSet = {
      name: datasetName,
      storageName: storageName,
      path: path,
      awsAccountId: awsAccountId,
      storageType: storageProvider.getStorageType()
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
    await storageProvider.importStorage(storageName, path);
    const imported: DataSet = {
      name: datasetName,
      storageName: storageName,
      path: path,
      awsAccountId: awsAccountId,
      storageType: storageProvider.getStorageType()
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
   * @returns the object needed to mount the Dataset in an external environment.
   */
  public async getDataSetMountObject(
    dataSetId: string,
    endPointId: string
  ): Promise<{ [key: string]: string }> {
    const targetDS: DataSet = await this.getDataSet(dataSetId);

    if (!_.find(targetDS.externalEndpoints, (ep) => ep === endPointId))
      throw Boom.notFound(`'${endPointId}' not found on DataSet '${dataSetId}'.`);

    const endPoint = await this.getExternalEndPoint(dataSetId, endPointId);
    if (!endPoint.endPointAlias || !endPoint.id) throw Boom.notFound('Endpoint has missing information');

    return this._generateMountObject(
      endPoint.dataSetName,
      endPoint.endPointAlias!,
      endPoint.path,
      endPoint.id!
    );
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
   * Removes an external endpoint to a DataSet.
   *
   * @param dataSetId - the name of the DataSet from which the endpoint will be removed.
   * @param externalEndpointId - the ID of the endpoint to remove.
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} initialized with permissions
   * to modify the target DataSet's underlying storage.
   */
  public async removeDataSetExternalEndpoint(
    dataSetId: string,
    externalEndpointId: string,
    storageProvider: DataSetsStoragePlugin
  ): Promise<void> {
    const targetDS: DataSet = await this.getDataSet(dataSetId);
    const targetEndpoint = await this.getExternalEndPoint(dataSetId, externalEndpointId);

    if (!targetDS.externalEndpoints || !_.find(targetDS.externalEndpoints, (ep) => ep === externalEndpointId))
      return;

    await storageProvider.removeExternalEndpoint(targetEndpoint.name, targetDS.awsAccountId!);

    targetDS.externalEndpoints = _.remove(targetDS.externalEndpoints, (endpoint) => {
      return endpoint === externalEndpointId;
    });

    await this._dbProvider.updateDataSet(targetDS);
  }

  /**
   * Add an external endpoint to a DataSet.
   *
   * @param dataSetId - the name of the DataSet to which the endpoint will be added.
   * @param externalEndpointName - the name of the endpoint to add.
   * @param externalRoleName - a role which will interact with the endpoint.
   * @param storageProvider - an instance of {@link DataSetsStoragePlugin} initialized with permissions
   * to modify the target DataSet's underlying storage.
   * @returns a JSON object which contains an alias to mount the storage, the DataSet's name, endpoint ID and the storage path.
   */
  public async addDataSetExternalEndpoint(
    dataSetId: string,
    externalEndpointName: string,
    storageProvider: DataSetsStoragePlugin,
    externalRoleName?: string
  ): Promise<{ [key: string]: string }> {
    const targetDS: DataSet = await this.getDataSet(dataSetId);

    if (_.find(targetDS.externalEndpoints, (ep) => ep === externalEndpointName))
      throw Boom.badRequest(`'${externalEndpointName}' already exists in '${dataSetId}'.`);

    const connections: EndpointConnectionStrings = await storageProvider.addExternalEndpoint(
      targetDS.storageName,
      targetDS.path,
      externalEndpointName,
      targetDS.awsAccountId!,
      externalRoleName
    );

    const endPointParam: ExternalEndpoint = {
      name: externalEndpointName,
      dataSetId: targetDS.id!,
      dataSetName: targetDS.name,
      path: targetDS.path,
      endPointUrl: connections.endPointUrl,
      endPointAlias: connections.endPointAlias
    };

    if (externalRoleName) {
      endPointParam.allowedRoles = [externalRoleName];
    }

    const endPoint: ExternalEndpoint = await this._dbProvider.addExternalEndpoint(endPointParam);

    if (!targetDS.externalEndpoints) targetDS.externalEndpoints = [];

    targetDS.externalEndpoints.push(endPoint.id!);

    await this._dbProvider.updateDataSet(targetDS);
    return this._generateMountObject(
      endPoint.dataSetName,
      endPoint.endPointAlias!,
      endPoint.path,
      endPoint.id!
    );
  }

  /**
   * Adds a role to an existing endpoint.
   *
   * @param dataSetId - the ID of the DataSet.
   * @param endPointId - the ID of the endpoint.
   * @param externalRoleArn  - the ARN of the role to add to the endpoint.
   * @param storageProvider - an instance of DataSetsStoragePlugin intialized to access the endpoint.
   * @param kmsKeyArn - an optional ARN to a KMS key used to encrypt data in the DataSet.
   */
  public async addRoleToExternalEndpoint(
    dataSetId: string,
    endPointId: string,
    externalRoleArn: string,
    storageProvider: DataSetsStoragePlugin,
    kmsKeyArn?: string
  ): Promise<void> {
    const endPointDetails: ExternalEndpoint = await this._dbProvider.getDataSetEndPointDetails(
      dataSetId,
      endPointId
    );
    endPointDetails.allowedRoles = endPointDetails.allowedRoles || [];
    if (_.find(endPointDetails.allowedRoles, (r) => r === externalRoleArn)) return;

    await storageProvider.addRoleToExternalEndpoint(
      endPointDetails.dataSetName,
      endPointDetails.path,
      endPointDetails.name,
      externalRoleArn,
      endPointDetails.endPointUrl,
      kmsKeyArn
    );
    endPointDetails.allowedRoles.push(externalRoleArn);
    await this._dbProvider.updateExternalEndpoint(endPointDetails);
  }

  /**
   * Get the details of an external endpoint.
   * @param dataSetId - the ID of the DataSet.
   * @param endPointId - the id of the EndPoint.
   * @returns - the details of the endpoint.
   */
  public async getExternalEndPoint(dataSetId: string, endPointId: string): Promise<ExternalEndpoint> {
    return await this._dbProvider.getDataSetEndPointDetails(dataSetId, endPointId);
  }

  private _generateMountObject(
    dataSetName: string,
    endPointURL: string,
    path: string,
    endpointId: string
  ): { [key: string]: string } {
    return {
      name: dataSetName,
      bucket: endPointURL,
      prefix: path,
      endpointId
    };
  }
}
