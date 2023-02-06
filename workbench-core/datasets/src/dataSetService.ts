/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, Metadata } from '@aws/workbench-core-audit';
import { AuthenticatedUser, isForbiddenError } from '@aws/workbench-core-authorization';
import { LoggingService } from '@aws/workbench-core-logging';
import _ from 'lodash';
import { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
import { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
import { DataSetsStoragePlugin } from './dataSetsStoragePlugin';
import { DataSetHasEndpointError } from './errors/dataSetHasEndpointError';
import { DataSetInvalidParameterError } from './errors/dataSetInvalidParameterError';
import { EndpointNotFoundError } from './errors/endpointNotFoundError';
import { InvalidPermissionError } from './errors/invalidPermissionError';
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
      if (request.owner && !request.ownerType) {
        throw new DataSetInvalidParameterError("'ownerType' is required when 'owner' is provided.");
      }
      const { storageProvider, ...dataSet } = request;

      await storageProvider.createStorage(dataSet.storageName, dataSet.path);

      const provisioned: CreateDataSet = {
        ...dataSet,
        storageType: storageProvider.getStorageType()
      };
      const response = await this._dbProvider.addDataSet(provisioned);
      response.permissions = await this._updateNewDataSetPermissions(response, request);
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
      if (request.owner && !request.ownerType) {
        throw new DataSetInvalidParameterError("'ownerType' is required when 'owner' is provided.");
      }
      const { storageProvider, ...dataSet } = request;

      await storageProvider.importStorage(dataSet.storageName, dataSet.path);

      const imported: CreateDataSet = {
        ...dataSet,
        storageType: storageProvider.getStorageType()
      };
      const response = await this._dbProvider.addDataSet(imported);
      response.permissions = await this._updateNewDataSetPermissions(response, request);
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
  ): Promise<DataSet> {
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
      const [accessResponse] = await Promise.all([
        this._authzPlugin.removeAllAccessPermissions(dataSetId, authenticatedUser),
        this._dbProvider.removeDataSet(dataSetId)
      ]);

      targetDS.permissions = accessResponse.data.permissions;
      await this._audit.write(metadata, targetDS);
      return targetDS;
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Get the mount configuration string for a DataSet.
   *
   * @param request - a {@link GetDataSetMountPointRequest} object
   *
   * @returns a {@link GetDataSetMountPointResponse} object
   *
   * @throws {@link NotAuthorizedError} - identity doesnt have permission to access either the dataset or the endpoint
   * @throws {@link DataSetNotFoundError} - the dataset does not exist
   * @throws {@link EndpointNotFoundError} - the endpoint does not exist
   * @throws {@link InvalidEndpointError} - the endpoint does not have an alias associated with it
   */
  public async getDataSetMountObject(
    request: GetDataSetMountPointRequest
  ): Promise<GetDataSetMountPointResponse> {
    const { authenticatedUser, dataSetId, endpointId } = request;

    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getDataSetMountObject.name,
      source: {
        serviceName: DataSetService.name
      },
      requestBody: request
    };
    try {
      await this.getDataSet(dataSetId, authenticatedUser);

      const allPermissions = await this._getAuthenticatedUserDatasetPermissions(authenticatedUser, dataSetId);

      if (!allPermissions.length) {
        throw new NotAuthorizedError(
          `The authenticated user does not have permission to access dataSet "${dataSetId}.`
        );
      }

      const endpoint = await this.getExternalEndPoint(dataSetId, endpointId, authenticatedUser);

      const hasEndPointPermission = allPermissions.some(
        ({ accessLevel }) => accessLevel === endpoint.accessLevel
      );

      if (!hasEndPointPermission) {
        throw new NotAuthorizedError(
          `The authenticated user does not have permission to access endpoint "${endpointId}.`
        );
      }

      const response = {
        data: {
          mountObject: this._generateMountObject(
            endpoint.dataSetName,
            endpoint.endPointAlias,
            endpoint.path,
            endpoint.id
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
  public async listDataSets(authenticatedUser: AuthenticatedUser): Promise<DataSet[]> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.listDataSets.name,
      source: {
        serviceName: DataSetService.name
      }
    };

    try {
      const response: DataSet[] = [];
      const allDatasets = await this._dbProvider.listDataSets();

      await Promise.all(
        allDatasets.map(async (dataset) => {
          try {
            // throws a ForbiddenError if the user doesnt have permission on the dataset
            await this._authzPlugin.isAuthorizedOnDataSet(dataset.id, 'read-only', authenticatedUser);
            response.push(dataset);
          } catch (error) {
            if (!isForbiddenError(error)) {
              throw error;
            }
          }
        })
      );

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
  public async getDataSet(dataSetId: string, authenticatedUser: AuthenticatedUser): Promise<DataSet> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getDataSet.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId: dataSetId
    };
    try {
      const [dataSetResponse, permissionsResponse] = await Promise.all([
        this._dbProvider.getDataSetMetadata(dataSetId),
        this._authzPlugin.getAllDataSetAccessPermissions(dataSetId)
      ]);
      const response = {
        ...dataSetResponse,
        permissions: permissionsResponse.data.permissions
      };
      let nextPermissions = permissionsResponse;
      while (nextPermissions.pageToken) {
        nextPermissions = await this._authzPlugin.getAllDataSetAccessPermissions(
          dataSetId,
          permissionsResponse.pageToken
        );
        response.permissions.push(...nextPermissions.data.permissions);
      }
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
      const targetDS = await this.getDataSet(dataSetId, authenticatedUser);
      const targetEndpoint = await this.getExternalEndPoint(dataSetId, externalEndpointId, authenticatedUser);

      if (!targetDS.externalEndpoints?.find((endpointId) => endpointId === targetEndpoint.id)) {
        throw new EndpointNotFoundError(
          `Could not find the endpoint '${externalEndpointId}' on '${dataSetId}'.`
        );
      }

      await storageProvider.removeExternalEndpoint(targetEndpoint.name, targetDS.awsAccountId!);

      targetDS.externalEndpoints = targetDS.externalEndpoints.filter(
        (endpointId) => endpointId !== targetEndpoint.id
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
   * @param endpointId - the ID of the endpoint.
   * @param externalRoleArn  - the ARN of the role to add to the endpoint.
   * @param storageProvider - an instance of DataSetsStoragePlugin intialized to access the endpoint.
   * @param kmsKeyArn - an optional ARN to a KMS key used to encrypt data in the DataSet.
   */
  public async addRoleToExternalEndpoint(
    dataSetId: string,
    endpointId: string,
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
      endpointId,
      externalRoleArn,
      kmsKeyArn
    };
    try {
      const endpointDetails: ExternalEndpoint = await this._dbProvider.getDataSetEndPointDetails(
        dataSetId,
        endpointId
      );

      endpointDetails.allowedRoles = endpointDetails.allowedRoles || [];
      if (endpointDetails.allowedRoles.find((r) => r === externalRoleArn)) {
        return;
      }

      await storageProvider.addRoleToExternalEndpoint(
        endpointDetails.dataSetName,
        endpointDetails.path,
        endpointDetails.name,
        externalRoleArn,
        endpointDetails.endPointUrl,
        kmsKeyArn
      );
      endpointDetails.allowedRoles.push(externalRoleArn);
      await this._dbProvider.updateExternalEndpoint(endpointDetails);
      await this._audit.write(metadata);
    } catch (error) {
      await this._audit.write(metadata, error);
      throw error;
    }
  }

  /**
   * Get the details of an external endpoint.
   * @param dataSetId - the ID of the DataSet.
   * @param endpointId - the id of the EndPoint.
   * @returns - the details of the endpoint.
   */
  public async getExternalEndPoint(
    dataSetId: string,
    endpointId: string,
    authenticatedUser: { id: string; roles: string[] }
  ): Promise<ExternalEndpoint> {
    const metadata: Metadata = {
      actor: authenticatedUser,
      action: this.getExternalEndPoint.name,
      source: {
        serviceName: DataSetService.name
      },
      dataSetId,
      endpointId
    };
    try {
      const response = await this._dbProvider.getDataSetEndPointDetails(dataSetId, endpointId);
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
      action: this.getDataSetAccessPermissions.name,
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
      const dataSetResponse = await this.getDataSet(dataSetId, authenticatedUser);
      const response = {
        data: {
          dataSetId: dataSetResponse.id!,
          permissions: dataSetResponse.permissions!
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
    endpointURL: string,
    path: string,
    endpointId: string
  ): DataSetMountObject {
    return {
      name: dataSetName,
      bucket: endpointURL,
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

    const endpointParam: CreateExternalEndpoint = {
      name: externalEndpointName,
      dataSetId: targetDS.id,
      dataSetName: targetDS.name,
      path: targetDS.path,
      endPointUrl: connectionsData.connections.endPointUrl,
      endPointAlias: connectionsData.connections.endPointAlias,
      accessLevel
    };

    if (externalRoleName) {
      endpointParam.allowedRoles = [externalRoleName];
    }

    const endpoint: ExternalEndpoint = await this._dbProvider.addExternalEndpoint(endpointParam);

    if (!targetDS.externalEndpoints) {
      targetDS.externalEndpoints = [];
    }

    targetDS.externalEndpoints.push(endpoint.id);

    await this._dbProvider.updateDataSet(targetDS);

    return {
      data: {
        mountObject: this._generateMountObject(
          endpoint.dataSetName,
          endpoint.endPointAlias,
          endpoint.path,
          endpoint.id
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
    throw new InvalidPermissionError('No permissions exist');
  }

  /**
   * Gets the user and group dataset permissions for the passed in authenticated user
   */
  private async _getAuthenticatedUserDatasetPermissions(
    authenticatedUser: AuthenticatedUser,
    dataSetId: string
  ): Promise<DataSetPermission[]> {
    const userPermissionsPromise = this._authzPlugin.getAccessPermissions({
      dataSetId,
      identity: authenticatedUser.id,
      identityType: 'USER'
    });

    const groupPermissionsPromises = authenticatedUser.roles.map((role) =>
      this._authzPlugin.getAccessPermissions({ dataSetId, identity: role, identityType: 'GROUP' })
    );
    const permissionsData = await Promise.all([userPermissionsPromise, ...groupPermissionsPromises]);
    const permissions = permissionsData.map((data) => data.data.permissions);

    return ([] as DataSetPermission[]).concat(...permissions);
  }

  private async _updateNewDataSetPermissions(
    dataset: DataSet,
    request: CreateProvisionDatasetRequest
  ): Promise<DataSetPermission[]> {
    let permissions: DataSetPermission[];

    if (_.isEmpty(request.permissions)) {
      permissions = [
        {
          identity: request.owner ? request.owner : request.authenticatedUser.id,
          identityType: request.owner ? request.ownerType! : 'USER',
          accessLevel: 'read-only'
        }
      ];
    } else {
      permissions = request.permissions!;
    }
    const response: PermissionsResponse = await this._authzPlugin.addAccessPermission({
      authenticatedUser: request.authenticatedUser,
      dataSetId: dataset.id,
      permission: permissions
    });

    return response.data.permissions;
  }
}
