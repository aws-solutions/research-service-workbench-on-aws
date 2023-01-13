/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, Metadata } from '@aws/workbench-core-audit';
import { LoggingService } from '@aws/workbench-core-logging';
import * as Boom from '@hapi/boom';
import _ from 'lodash';
import { DataSet } from './dataSet';
import { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
import { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
import { DataSetsStoragePlugin } from './dataSetsStoragePlugin';
import { DataSetHasEndpointError } from './errors/dataSetHasEndpointError';
import { NotAuthorizedError } from './errors/notAuthorizedError';
import { ExternalEndpoint } from './externalEndpoint';
import {
  AddDataSetExternalEndpointForUserRequest,
  AddDataSetExternalEndpointResponse
} from './models/addDataSetExternalEndpoint';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { CreateProvisionDatasetRequest } from './models/createProvisionDatasetRequest';
import { DataSetMountObject } from './models/dataSetMountObject';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { PermissionsResponse } from './models/permissionsResponse';
import { StorageLocation } from './storageLocation';

export class DataSetService {
  private _audit: AuditService;
  private _log: LoggingService;
  private _dbProvider: DataSetMetadataPlugin;
  private _authzPlugin: DataSetsAuthorizationPlugin;
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
  public constructor(
    audit: AuditService,
    log: LoggingService,
    masterDbProvider: DataSetMetadataPlugin,
    authorizationPlugin: DataSetsAuthorizationPlugin
  ) {
    this._audit = audit;
    this._log = log;
    this._dbProvider = masterDbProvider;
    this._authzPlugin = authorizationPlugin;
  }

  /**
   * Adds a new DataSet to the provided storage.
   * @param request - {@link CreateProvisionDatasetRequest}
   *
   * @returns the DataSet object which is stored in the backing datastore.
   */
  public async provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    const metadata: Metadata = {
      actor: request.authenticatedUser,
      action: this.provisionDataSet.name,
      source: {
        serviceName: DataSetService.name
      },
      requestBody: request
    };

    try {
      const { storageProvider, ...dataSet } = request;

      await storageProvider.createStorage(dataSet.storageName, dataSet.path);

      const provisioned: DataSet = {
        ...dataSet,
        storageType: storageProvider.getStorageType()
      };
      const response = await this._dbProvider.addDataSet(provisioned);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Imports an existing storage location into the solution as a DataSet.
   * @param request - {@link CreateProvisionDatasetRequest}
   *
   * @returns the DataSet object which is stored in teh backing datastore.
   */
  public async importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    const metadata: Metadata = {
      actor: request.authenticatedUser,
      action: this.importDataSet.name,
      source: {
        serviceName: DataSetService.name
      },
      requestBody: request
    };
    try {
      const { storageProvider, ...dataSet } = request;

      await storageProvider.importStorage(dataSet.storageName, dataSet.path);

      const imported: DataSet = {
        ...dataSet,
        storageType: storageProvider.getStorageType()
      };
      const response = await this._dbProvider.addDataSet(imported);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
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
    checkDependency: (dataSetId: string) => Promise<void>,
    authenticatedUser: {
      id: string;
      roles: string[];
    }
  ): Promise<void> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.removeDataSet.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId
    };
    try {
      await checkDependency(dataSetId);

      const targetDS: DataSet = await this.getDataSet(dataSetId, authenticatedUser);
      if (targetDS.externalEndpoints?.length) {
        throw new DataSetHasEndpointError(
          'External endpoints found on Dataset must be removed before DataSet can be removed.'
        );
      }
      await this._dbProvider.removeDataSet(dataSetId);
      await this._audit.write(metadata);
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Get the mount configuration string for a DataSet.
   * @param dataSetId - the ID of the DataSet.
   * @param endPointId - the ID of the endpoint to remove.
   *
   * @returns a {@link DataSetMountObject}
   */
  public async getDataSetMountObject(
    dataSetId: string,
    endPointId: string,
    authenticatedUser: {
      id: string;
      roles: string[];
    }
  ): Promise<DataSetMountObject> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getDataSetMountObject.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId: dataSetId,
      endPointid: endPointId
    };
    try {
      const targetDS: DataSet = await this.getDataSet(dataSetId, authenticatedUser);

      if (!_.find(targetDS.externalEndpoints, (ep) => ep === endPointId))
        throw Boom.notFound(`'${endPointId}' not found on DataSet '${dataSetId}'.`);

      const endPoint = await this.getExternalEndPoint(dataSetId, endPointId, authenticatedUser);
      if (!endPoint.endPointAlias || !endPoint.id) throw Boom.notFound('Endpoint has missing information');

      const response = this._generateMountObject(
        endPoint.dataSetName,
        endPoint.endPointAlias!,
        endPoint.path,
        endPoint.id!
      );
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * List the currently known DataSets.
   *
   * @returns an array of DataSet objects.
   */
  public async listDataSets(authenticatedUser: { id: string; roles: string[] }): Promise<DataSet[]> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.listDataSets.name,
      source: {
        serviceName: DataSetService.name
      }
    };
    try {
      const response = await this._dbProvider.listDataSets();
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Get details on a particular DataSet.
   *
   * @param dataSetId - the Id of the DataSet for which details are desired.
   * @returns - the DataSet object associated with that DataSet.
   */
  public async getDataSet(
    dataSetId: string,
    authenticatedUser: { id: string; roles: string[] }
  ): Promise<DataSet> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getDataSet.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId: dataSetId
    };
    try {
      const response = await this._dbProvider.getDataSetMetadata(dataSetId);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
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
    storageProvider: DataSetsStoragePlugin,
    authenticatedUser: {
      id: string;
      roles: string[];
    }
  ): Promise<void> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.removeDataSetExternalEndpoint.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId,
      externalEndpointId
    };
    try {
      const targetDS: DataSet = await this.getDataSet(dataSetId, authenticatedUser);
      const targetEndpoint = await this.getExternalEndPoint(dataSetId, externalEndpointId, authenticatedUser);

      if (
        !targetDS.externalEndpoints ||
        !_.find(targetDS.externalEndpoints, (ep) => ep === externalEndpointId)
      )
        return;

      await storageProvider.removeExternalEndpoint(targetEndpoint.name, targetDS.awsAccountId!);

      targetDS.externalEndpoints = _.remove(targetDS.externalEndpoints, (endpoint) => {
        return endpoint === externalEndpointId;
      });

      await this._dbProvider.updateDataSet(targetDS);
      await this._audit.write(metadata);
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Add an external endpoint to a DataSet.
   *
   * @param request - the {@link AddDataSetExternalEndpointForUserRequest} object
   * @returns the {@link AddDataSetExternalEndpointResponse} object
   */
  public async addDataSetExternalEndpointForUser(
    request: AddDataSetExternalEndpointForUserRequest
  ): Promise<AddDataSetExternalEndpointResponse> {
    const {
      authenticatedUser,
      dataSetId,
      userId,
      externalEndpointName,
      storageProvider,
      externalRoleName,
      kmsKeyArn,
      vpcId
    } = request;

    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.addDataSetExternalEndpointForUser.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId,
      externalEndpointName,
      externalRoleName,
      kmsKeyArn,
      vpcId
    };

    try {
      let { data: permissionsData } = await this._authzPlugin.getAccessPermissions({
        dataSetId,
        identity: userId,
        identityType: 'USER'
      });
      // TODO: Remove if-block after AddExternalEndpontforGroup is complete.
      if (!permissionsData.permissions.length) {
        const permissionResponse = await this._authzPlugin.getAccessPermissions({
          dataSetId,
          identity: userId,
          identityType: 'GROUP'
        });
        permissionsData = permissionResponse.data;
      }
      if (!permissionsData.permissions.length) {
        throw new NotAuthorizedError(
          `User "${userId}" does not have permission to access dataset "${dataSetId}.`
        );
      }

      const readOnly = permissionsData.permissions.some(({ accessLevel }) => accessLevel === 'read-only');

      const targetDS = await this.getDataSet(dataSetId, authenticatedUser);

      if (_.find(targetDS.externalEndpoints, (ep) => ep === externalEndpointName))
        throw Boom.badRequest(`'${externalEndpointName}' already exists in '${dataSetId}'.`);

      const { data: connectionsData } = await storageProvider.addExternalEndpoint({
        name: targetDS.storageName,
        path: targetDS.path,
        externalEndpointName,
        ownerAccountId: targetDS.awsAccountId!,
        accessLevel: readOnly ? 'read-only' : 'read-write',
        externalRoleName,
        kmsKeyArn,
        vpcId
      });

      const endPointParam: ExternalEndpoint = {
        name: externalEndpointName,
        dataSetId: targetDS.id!,
        dataSetName: targetDS.name,
        path: targetDS.path,
        endPointUrl: connectionsData.connections.endPointUrl,
        endPointAlias: connectionsData.connections.endPointAlias
      };

      if (externalRoleName) {
        endPointParam.allowedRoles = [externalRoleName];
      }

      const endPoint: ExternalEndpoint = await this._dbProvider.addExternalEndpoint(endPointParam);

      if (!targetDS.externalEndpoints) targetDS.externalEndpoints = [];

      targetDS.externalEndpoints.push(endPoint.id!);

      await this._dbProvider.updateDataSet(targetDS);

      const mountObject = this._generateMountObject(
        endPoint.dataSetName,
        endPoint.endPointAlias!,
        endPoint.path,
        endPoint.id!
      );
      const response = { data: { mountObject } };
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
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
    authenticatedUser: {
      id: string;
      roles: string[];
    },
    kmsKeyArn?: string
  ): Promise<void> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.addRoleToExternalEndpoint.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId,
      endPointId,
      externalRoleArn,
      kmsKeyArn
    };
    try {
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
      await this._audit.write(metadata);
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Get the details of an external endpoint.
   * @param dataSetId - the ID of the DataSet.
   * @param endPointId - the id of the EndPoint.
   * @returns - the details of the endpoint.
   */
  public async getExternalEndPoint(
    dataSetId: string,
    endPointId: string,
    authenticatedUser: { id: string; roles: string[] }
  ): Promise<ExternalEndpoint> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getExternalEndPoint.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId,
      endPointId
    };
    try {
      const response = await this._dbProvider.getDataSetEndPointDetails(dataSetId, endPointId);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
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
    storageProvider: DataSetsStoragePlugin,
    authenticatedUser: {
      id: string;
      roles: string[];
    }
  ): Promise<string> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getExternalEndPoint.name,
      source: {
        serviceName: DataSetService.name
      },
      datasetId,
      fileName,
      timeToLiveSeconds
    };
    try {
      const dataset = await this.getDataSet(datasetId, authenticatedUser);

      const response = await storageProvider.createPresignedUploadUrl(dataset, fileName, timeToLiveSeconds);
      await this._audit.write(metadata, { uploadUrl: response });
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Gets a list of {@link StorageLocation}s being used by existing datasets.
   *
   * @returns - a list of {@link StorageLocation}s
   */
  public async listStorageLocations(authenticatedUser: {
    id: string;
    roles: string[];
  }): Promise<StorageLocation[]> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.listStorageLocations.name,
      source: {
        serviceName: DataSetService.name
      }
    };
    try {
      const response = await this._dbProvider.listStorageLocations();
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  //
  // DataSet Permissions
  //

  /**
   * Add AccessPermissions to a DataSet.
   *
   * @param params - a {@link AddRemoveAccessPermissionRequest} object indicating the datasetId and the
   *                 requested permissions.
   * @returns a {@link PermissionsResponse} object containing the permissions added.
   */
  public async addDataSetAccessPermissions(
    params: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse> {
    const metadata: Metadata = {
      actor: params.authenticatedUser,
      action: this.addDataSetAccessPermissions.name,
      source: {
        serviceName: DataSetService.name
      },
      requestBody: params
    };

    try {
      // this will throw if the dataset is not found.
      await this.getDataSet(params.dataSetId, params.authenticatedUser);
      const response: PermissionsResponse = await this._authzPlugin.addAccessPermission(params);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Get current access permissions for a particular identity on the given dataset.
   *
   * @param params - a {@link GetAccessPermissionsRequest} indicating the dataset and identity for which the
   * permissions should be obtained.
   * @param authenticatedUser - the 'id' of the user and that user's roles
   * @returns a {@link PermissionsResponse} object containing the permissions found
   */
  public async getDataSetAccessPermissions(
    params: GetAccessPermissionRequest,
    authenticatedUser: { id: string; roles: string[] }
  ): Promise<PermissionsResponse> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getAllDataSetAccessPermissions.name,
      source: {
        serviceName: DataSetService.name
      },
      params
    };
    try {
      await this.getDataSet(params.dataSetId, authenticatedUser);
      const response = await this._authzPlugin.getAccessPermissions(params);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Get all access permissions (read-only or read-write) associated with the dataset.
   *
   * @param dataSetId - the id of the dataset for which permmissions are to be obtained.
   * @param authenticatedUser - the 'id' of the user and that user's roles.
   * @param pageToken - a token from a pervious query to continue recieving results.
   * @returns a {@link PermissionsResponse} object containing the permissions found.
   */
  public async getAllDataSetAccessPermissions(
    dataSetId: string,
    authenticatedUser: { id: string; roles: string[] },
    pageToken?: string
  ): Promise<PermissionsResponse> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getAllDataSetAccessPermissions.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId
    };
    try {
      await this.getDataSet(dataSetId, authenticatedUser);
      const response = await this._authzPlugin.getAllDataSetAccessPermissions(dataSetId, pageToken);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Remove AccessPermissions from a DataSet.
   *
   * @param params - a {@link AddRemoveAccessPermissionRequest} object indicating the datasetId and the
   *                 requested permissions.
   * @returns a {@link PermissionsResponse} object containing the permissions removed.
   */
  public async removeDataSetAccessPermissions(
    params: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse> {
    const metadata: Metadata = {
      actor: params.authenticatedUser,
      action: this.removeDataSetAccessPermissions.name,
      source: {
        serviceName: DataSetService.name
      },
      requestBody: params
    };

    try {
      // this will throw if the dataset is not found.
      await this.getDataSet(params.dataSetId, params.authenticatedUser);
      const response: PermissionsResponse = await this._authzPlugin.removeAccessPermissions(params);
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  private _generateMountObject(
    dataSetName: string,
    endPointURL: string,
    path: string,
    endpointId: string
  ): DataSetMountObject {
    return {
      name: dataSetName,
      bucket: endPointURL,
      prefix: path,
      endpointId
    };
  }
}
