/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AddRemoveAccessPermissionRequest,
  DataSet,
  DataSetAddExternalEndpointResponse,
  DataSetExternalEndpointRequest,
  DataSetPlugin,
  DataSetStoragePlugin,
  GetAccessPermissionRequest,
  PermissionsResponse,
  PermissionsResponseParser
} from '@aws/swb-app';
import {
  Action,
  AuthenticatedUser,
  CreateIdentityPermissionsRequestParser,
  DynamicAuthorizationService,
  IdentityPermission
} from '@aws/workbench-core-authorization';
import { IdentityPermissionParser } from '@aws/workbench-core-authorization/lib/dynamicAuthorization/dynamicAuthorizationInputs/identityPermission';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import {
  CreateProvisionDatasetRequest,
  DataSetsAuthorizationPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { Associable, DatabaseServicePlugin } from './databaseService';

export class DataSetService implements DataSetPlugin {
  public readonly storagePlugin: DataSetStoragePlugin;
  private _dataSetsAuthService: DataSetsAuthorizationPlugin;
  private _workbenchDataSetService: WorkbenchDataSetService;
  private _databaseService: DatabaseServicePlugin;
  private _dynamicAuthService: DynamicAuthorizationService;

  public constructor(
    dataSetStoragePlugin: DataSetStoragePlugin,
    workbenchDataSetService: WorkbenchDataSetService,
    dataSetAuthService: DataSetsAuthorizationPlugin,
    databaseService: DatabaseServicePlugin,
    dynamicAuthService: DynamicAuthorizationService
  ) {
    this._workbenchDataSetService = workbenchDataSetService;
    this.storagePlugin = dataSetStoragePlugin;
    this._dataSetsAuthService = dataSetAuthService;
    this._databaseService = databaseService;
    this._dynamicAuthService = dynamicAuthService;
  }

  public addDataSetExternalEndpoint(
    request: DataSetExternalEndpointRequest
  ): Promise<DataSetAddExternalEndpointResponse> {
    return this._workbenchDataSetService.addDataSetExternalEndpointForUser({
      ...request,
      userId: request.groupId,
      storageProvider: this.storagePlugin
    });
  }

  public getDataSet(dataSetId: string): Promise<DataSet> {
    return this._workbenchDataSetService.getDataSet(dataSetId, { id: '', roles: [] });
  }

  public importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    return this._workbenchDataSetService.importDataSet(request);
  }

  public listDataSets(): Promise<DataSet[]> {
    return this._workbenchDataSetService.listDataSets({ id: '', roles: [] });
  }

  public async provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    //add permissions in AuthZ for user to read, write, update, delete, and update read/write permissions
    const dataset = await this._workbenchDataSetService.provisionDataSet(request);
    const projectId = dataset.owner!;
    const projectAdmin = `${projectId}#PA`;

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      'DATASET',
      dataset.id!,
      [projectAdmin],
      ['READ', 'UPDATE', 'DELETE']
    );

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      'DATASET_ACCESS_LEVELS',
      `${projectId}-${dataset.id!}`,
      [projectAdmin],
      ['READ', 'UPDATE']
    );

    if (dataset.id && request.permissions && request.permissions.length) {
      await this._workbenchDataSetService.addDataSetAccessPermissions({
        authenticatedUser: request.authenticatedUser,
        permission: request.permissions[0],
        dataSetId: dataset.id
      });
    }

    return dataset;
  }

  public async addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse> {
    const response = await this._dataSetsAuthService.addAccessPermission(params);
    return PermissionsResponseParser.parse(response);
  }

  public async getAccessPermissions(params: GetAccessPermissionRequest): Promise<PermissionsResponse> {
    const response = await this._dataSetsAuthService.getAccessPermissions(params);
    return PermissionsResponseParser.parse(response);
  }

  public async getAllDataSetAccessPermissions(datasetId: string): Promise<PermissionsResponse> {
    const response = await this._dataSetsAuthService.getAllDataSetAccessPermissions(datasetId);
    return PermissionsResponseParser.parse(response);
  }

  public async removeAccessPermissions(
    params: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse> {
    const response = await this._dataSetsAuthService.removeAccessPermissions(params);
    return PermissionsResponseParser.parse(response);
  }

  public async removeAllAccessPermissions(datasetId: string): Promise<PermissionsResponse> {
    const response = await this._dataSetsAuthService.removeAllAccessPermissions(datasetId);
    return PermissionsResponseParser.parse(response);
  }

  public async addAccessForProject(
    permissionRequest: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse> {
    const datasetId = permissionRequest.dataSetId;
    const projectId = permissionRequest.permission.identity;
    const projectAdmin = `${projectId}#PA`;
    const projectResearcher = `${projectId}#Researcher`;

    await this._addAuthZPermissionsForDataset(
      permissionRequest.authenticatedUser,
      'DATASET',
      datasetId,
      [projectAdmin, projectResearcher],
      ['READ']
    );

    const response = await this.addAccessPermission(permissionRequest);

    const dataset: Associable = {
      type: resourceTypeToKey.dataset,
      id: permissionRequest.dataSetId,
      data: {
        id: projectId,
        permission: permissionRequest.permission.accessLevel
      }
    };

    const project: Associable = {
      type: resourceTypeToKey.project,
      id: projectId,
      data: {
        id: permissionRequest.dataSetId,
        permission: permissionRequest.permission.accessLevel
      }
    };

    await this._databaseService.storeAssociations(dataset, [project]);

    return response;
  }

  private async _addAuthZPermissionsForDataset(
    authenticatedUser: AuthenticatedUser,
    subject: string,
    subjectId: string,
    roles: string[],
    actions: Action[]
  ): Promise<void> {
    const partialIdentityPermission = {
      action: undefined,
      effect: 'ALLOW',
      identityId: undefined,
      identityType: 'USER',
      subjectId: subjectId,
      subjectType: subject
    };

    const identityPermissions: IdentityPermission[] = [];

    for (const role of roles) {
      for (const action of actions) {
        const identityPermission = IdentityPermissionParser.parse({
          ...partialIdentityPermission,
          identityId: role,
          action
        });
        identityPermissions.push(identityPermission);
      }
    }

    const createRequest = CreateIdentityPermissionsRequestParser.parse({
      authenticatedUser,
      identityPermissions
    });

    await this._dynamicAuthService.createIdentityPermissions(createRequest);
  }
}
