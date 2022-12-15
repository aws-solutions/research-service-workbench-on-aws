/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService } from '@aws/workbench-core-audit';
import { LoggingService } from '@aws/workbench-core-logging';
import * as Boom from '@hapi/boom';
import _ from 'lodash';
import { DataSet } from './dataSet';
import { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
import { DataSetsStoragePlugin, EndpointConnectionStrings } from './dataSetsStoragePlugin';
import { DataSetHasEndpointError } from './errors/dataSetHasEndpointError';
import { ExternalEndpoint } from './externalEndpoint';
import { CreateProvisionDatasetRequest } from './models/createProvisionDatasetRequest';
import { StorageLocation } from './storageLocation';

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
   * @param request - {@link CreateProvisionDatasetRequest}
   *
   * @returns the DataSet object which is stored in the backing datastore.
   */
  public async provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    const { storageProvider, ...dataSet } = request;

    await storageProvider.createStorage(dataSet.storageName, dataSet.path);

    const provisioned: DataSet = {
      ...dataSet,
      storageType: storageProvider.getStorageType()
    };

    return await this._dbProvider.addDataSet(provisioned);
  }

  /**
   * Imports an existing storage location into the solution as a DataSet.
   * @param request - {@link CreateProvisionDatasetRequest}
   *
   * @returns the DataSet object which is stored in teh backing datastore.
   */
  public async importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    const { storageProvider, ...dataSet } = request;

    await storageProvider.importStorage(dataSet.storageName, dataSet.path);

    const imported: DataSet = {
      ...dataSet,
      storageType: storageProvider.getStorageType()
    };

    return await this._dbProvider.addDataSet(imported);
  }

  /**
   * Removes a DataSet from the solution however it does not delete the storage.
   * @param dataSetId - the ID of the DataSet to remove.
   * @param checkDependency - function to validate whether all required prerequisites are met before removing dataset.
   * If prerequisites are not met - function should throw error.
   * @throws DataSetHasEndpontError - if the dataset has external endpoints assigned.
   */
  public async removeDataSet(
    dataSetId: string,
    checkDependency: (dataSetId: string) => Promise<void>
  ): Promise<void> {
    await checkDependency(dataSetId);

    const targetDS: DataSet = await this.getDataSet(dataSetId);
    if (targetDS.externalEndpoints?.length) {
      throw new DataSetHasEndpointError(
        'External endpoints found on Dataset must be removed before DataSet can be removed.'
      );
    }
    await this._dbProvider.removeDataSet(dataSetId);
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
   * @param kmsKeyArn - an optional ARN of the KMS key used to encrypt the bucket.
   * @param vpcId - an optional ID of the VPC interacting with the endpoint.
   * @returns a JSON object which contains an alias to mount the storage, the DataSet's name, endpoint ID and the storage path.
   */
  public async addDataSetExternalEndpoint(
    dataSetId: string,
    externalEndpointName: string,
    storageProvider: DataSetsStoragePlugin,
    externalRoleName?: string,
    kmsKeyArn?: string,
    vpcId?: string
  ): Promise<{ [key: string]: string }> {
    const targetDS: DataSet = await this.getDataSet(dataSetId);

    if (_.find(targetDS.externalEndpoints, (ep) => ep === externalEndpointName))
      throw Boom.badRequest(`'${externalEndpointName}' already exists in '${dataSetId}'.`);

    const connections: EndpointConnectionStrings = await storageProvider.addExternalEndpoint(
      targetDS.storageName,
      targetDS.path,
      externalEndpointName,
      targetDS.awsAccountId!,
      externalRoleName,
      kmsKeyArn,
      vpcId
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

  /**
   * Create a presigned URL for a signle-part file upload
   * @param datasetId - the ID of the Dataset.
   * @param fileName - the name of the file to upload.
   * @param timeToLiveSeconds - length of time (in seconds) the URL is valid.
   * @param storageProvider - an instance of DataSetsStoragePlugin intialized to access the endpoint.
   * @returns the presigned URL
   */
  public async getPresignedSinglePartUploadUrl(
    datasetId: string,
    fileName: string,
    timeToLiveSeconds: number,
    storageProvider: DataSetsStoragePlugin
  ): Promise<string> {
    const dataset = await this.getDataSet(datasetId);

    return await storageProvider.createPresignedUploadUrl(dataset, fileName, timeToLiveSeconds);
  }

  /**
   * Gets a list of {@link StorageLocation}s being used by existing datasets.
   *
   * @returns - a list of {@link StorageLocation}s
   */
  public async listStorageLocations(): Promise<StorageLocation[]> {
    return await this._dbProvider.listStorageLocations();
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
