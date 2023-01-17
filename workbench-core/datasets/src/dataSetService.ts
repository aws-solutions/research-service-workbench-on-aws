/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, Metadata } from '@aws/workbench-core-audit';
import { LoggingService } from '@aws/workbench-core-logging';
import { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
import { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
import { DataSetsStoragePlugin } from './dataSetsStoragePlugin';
import { DataSetHasEndpointError } from './errors/dataSetHasEndpointError';
import { EndpointExistsError } from './errors/endpointExistsError';
import { InvalidEndpointError } from './errors/invalidEndpointError';
import { NotAuthorizedError } from './errors/notAuthorizedError';
import {
  AddDataSetExternalEndpointBaseRequest,
  AddDataSetExternalEndpointForGroupRequest,
  AddDataSetExternalEndpointForUserRequest,
  AddDataSetExternalEndpointResponse
} from './models/addDataSetExternalEndpoint';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { CreateProvisionDatasetRequest } from './models/createProvisionDatasetRequest';
import { CreateDataSet, DataSet } from './models/dataSet';
import { DataSetMountObject } from './models/dataSetMountObject';
import { DataSetPermission } from './models/dataSetPermission';
import { DataSetsAccessLevel } from './models/dataSetsAccessLevel';
import { CreateExternalEndpoint, ExternalEndpoint } from './models/externalEndpoint';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { GetDataSetMountPointRequest, GetDataSetMountPointResponse } from './models/getDataSetMountPoint';
import { PermissionsResponse } from './models/permissionsResponse';
import { StorageLocation } from './models/storageLocation';

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

      const provisioned: CreateDataSet = {
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
   * @returns the DataSet object which is stored in the backing datastore.
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

      const imported: CreateDataSet = {
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

      const targetDS = await this.getDataSet(dataSetId, authenticatedUser);
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
   *
   * @throws {@link NotAuthorizedError} - identity doesnt have permission to access either the dataset or the endpoint
   * @throws {@link DataSetNotFoundError} - the dataset does not exist
   * @throws {@link EndpointNotFoundError} - the endpoint does not exist
   * @throws {@link InvalidEndpointError} - the endpoint does not have an alias associated with it
   */
  public async getDataSetMountObject(
    request: GetDataSetMountPointRequest
  ): Promise<GetDataSetMountPointResponse> {
    const { authenticatedUser, dataSetId, endPointId, identity, identityType } = request;

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
      await this.getDataSet(dataSetId, authenticatedUser);

      const { data: permissionsData } = await this._authzPlugin.getAccessPermissions({
        dataSetId,
        identity,
        identityType
      });
      if (!permissionsData.permissions.length) {
        throw new NotAuthorizedError(
          `${identityType} "${identity}" does not have permission to access dataSet "${dataSetId}.`
        );
      }

      const endPoint = await this.getExternalEndPoint(dataSetId, endPointId, authenticatedUser);
      if (!endPoint.endPointAlias) {
        throw new InvalidEndpointError(
          `Endpoint "${endPointId}" does not have an "endPointAlias" associated with it.`
        );
      }

      const hasEndPointPermission = permissionsData.permissions.some(
        ({ accessLevel }) => accessLevel === endPoint.accessLevel
      );

      if (!hasEndPointPermission) {
        throw new NotAuthorizedError(
          `${identityType} "${identity}" does not have permission to access endpoint "${endPointId}.`
        );
      }

      const response = {
        data: {
          mountObject: this._generateMountObject(
            endPoint.dataSetName,
            endPoint.endPointAlias!,
            endPoint.path,
            endPoint.id!
          )
        }
      };

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

      if (!targetDS.externalEndpoints?.find((endpoint) => endpoint === targetEndpoint.name)) {
        return;
      }

      await storageProvider.removeExternalEndpoint(targetEndpoint.name, targetDS.awsAccountId!);

      targetDS.externalEndpoints = targetDS.externalEndpoints.filter(
        (endpoint) => endpoint !== targetEndpoint.name
      );

      await this._dbProvider.updateDataSet(targetDS);
      await this._audit.write(metadata);
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Add an external endpoint to a DataSet for a given group.
   *
   * @param request - the {@link AddDataSetExternalEndpointForGroupRequest} object
   *
   * @returns the {@link AddDataSetExternalEndpointResponse} object
   *
   * @throws {@link DataSetNotFoundError} - the dataset doesnt exist
   * @throws {@link NotAuthorizedError} - the group doesnt have permission to access the dataset
   * @throws {@link EndpointExistsError} - the requested endpoint already exists
   * @throws {@link InvalidArnError} - the externalRoleName request parameter is invalid
   * TODO add throws for authz get access permissions
   */
  public async addDataSetExternalEndpointForGroup(
    request: AddDataSetExternalEndpointForGroupRequest
  ): Promise<AddDataSetExternalEndpointResponse> {
    const metadata: Metadata = {
      actor: request.authenticatedUser,
      action: this.addDataSetExternalEndpointForGroup.name,
      source: {
        serviceName: DataSetService.name
      },
      requestBody: request
    };

    try {
      const response = await this._addDataSetExternalEndpoint({
        ...request,
        identity: request.groupId,
        identityType: 'GROUP'
      });
      await this._audit.write(metadata, response);
      return response;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Add an external endpoint to a DataSet for a given user.
   *
   * @param request - the {@link AddDataSetExternalEndpointForUserRequest} object
   *
   * @returns the {@link AddDataSetExternalEndpointResponse} object
   *
   * @throws {@link DataSetNotFoundError} - the dataset doesnt exist
   * @throws {@link NotAuthorizedError} - the group doesnt have permission to access the dataset
   * @throws {@link EndpointExistsError} - the requested endpoint already exists
   * @throws {@link InvalidArnError} - the externalRoleName request parameter is invalid
   * TODO add throws for authz get access permissions
   */
  public async addDataSetExternalEndpointForUser(
    request: AddDataSetExternalEndpointForUserRequest
  ): Promise<AddDataSetExternalEndpointResponse> {
    const metadata: Metadata = {
      actor: request.authenticatedUser,
      action: this.addDataSetExternalEndpointForUser.name,
      source: {
        serviceName: DataSetService.name
      },
      requestBody: request
    };

    try {
      const response = await this._addDataSetExternalEndpoint({
        ...request,
        identity: request.userId,
        identityType: 'USER'
      });
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
      if (endPointDetails.allowedRoles.find((r) => r === externalRoleArn)) {
        return;
      }

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

  private async _addDataSetExternalEndpoint(
    request: AddDataSetExternalEndpointBaseRequest
  ): Promise<AddDataSetExternalEndpointResponse> {
    const {
      authenticatedUser,
      dataSetId,
      identity,
      identityType,
      externalEndpointName,
      storageProvider,
      externalRoleName,
      kmsKeyArn,
      vpcId
    } = request;

    const targetDS = await this.getDataSet(dataSetId, authenticatedUser);

    const { data: permissionsData } = await this._authzPlugin.getAccessPermissions({
      dataSetId,
      identity,
      identityType
    });
    if (!permissionsData.permissions.length) {
      throw new NotAuthorizedError(
        `${identityType} "${identity}" does not have permission to access dataset "${dataSetId}.`
      );
    }

    if (targetDS.externalEndpoints?.find((ep) => ep === externalEndpointName)) {
      throw new EndpointExistsError(`'${externalEndpointName}' already exists in '${dataSetId}'.`);
    }

    const accessLevel = this._getMinimumAccessLevel(permissionsData.permissions);

    const { data: connectionsData } = await storageProvider.addExternalEndpoint({
      name: targetDS.storageName,
      path: targetDS.path,
      externalEndpointName,
      ownerAccountId: targetDS.awsAccountId!,
      accessLevel,
      externalRoleName,
      kmsKeyArn,
      vpcId
    });

    const endPointParam: CreateExternalEndpoint = {
      name: externalEndpointName,
      dataSetId: targetDS.id!,
      dataSetName: targetDS.name,
      path: targetDS.path,
      endPointUrl: connectionsData.connections.endPointUrl,
      endPointAlias: connectionsData.connections.endPointAlias,
      accessLevel
    };

    if (externalRoleName) {
      endPointParam.allowedRoles = [externalRoleName];
    }

    const endPoint: ExternalEndpoint = await this._dbProvider.addExternalEndpoint(endPointParam);

    if (!targetDS.externalEndpoints) {
      targetDS.externalEndpoints = [];
    }

    targetDS.externalEndpoints.push(endPoint.id!);

    await this._dbProvider.updateDataSet(targetDS);

    return {
      data: {
        mountObject: this._generateMountObject(
          endPoint.dataSetName,
          endPoint.endPointAlias!,
          endPoint.path,
          endPoint.id
        )
      }
    };
  }

  private _getMinimumAccessLevel(permissions: DataSetPermission[]): DataSetsAccessLevel {
    if (permissions.some(({ accessLevel }) => accessLevel === 'read-only')) {
      return 'read-only';
    }
    if (permissions.some(({ accessLevel }) => accessLevel === 'read-write')) {
      return 'read-write';
    }
    throw new NotAuthorizedError('No permissions exist');
  }
}
