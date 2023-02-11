/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DataSet,
  DataSetAddExternalEndpointResponse,
  DataSetExternalEndpointRequest,
  DataSetPlugin,
  DataSetStoragePlugin,
  GetAccessPermissionRequest,
  PermissionsResponse,
  PermissionsResponseParser
} from '@aws/swb-app';
import { ProjectAccessRequest } from '@aws/swb-app/lib/dataSets/projectAccessRequestParser';
import {
  Action,
  AuthenticatedUser,
  CreateIdentityPermissionsRequestParser,
  DynamicAuthorizationService,
  IdentityPermission,
  IdentityPermissionParser
} from '@aws/workbench-core-authorization';
import {
  AddRemoveAccessPermissionRequest,
  CreateProvisionDatasetRequest,
  DataSetsAuthorizationPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { SwbAuthZSubject } from '../constants';
import { getProjectAdminRole, getResearcherRole } from '../utils/roleUtils';
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
    return this._workbenchDataSetService.addDataSetExternalEndpointForGroup({
      ...request,
      storageProvider: this.storagePlugin
    });
  }

  public getDataSet(dataSetId: string, authenticatedUser: AuthenticatedUser): Promise<DataSet> {
    return this._workbenchDataSetService.getDataSet(dataSetId, authenticatedUser);
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

    const projectAdmin = dataset.owner!;
    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      dataset.id!,
      [projectAdmin],
      ['READ', 'UPDATE', 'DELETE']
    );

    const projectId = projectAdmin.split('#')[0];
    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
      `${projectId}-${dataset.id!}`,
      [projectAdmin],
      ['READ', 'UPDATE']
    );

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
    const response = await this._dataSetsAuthService.removeAllAccessPermissions(datasetId, {
      id: '',
      roles: []
    });
    return PermissionsResponseParser.parse(response);
  }

  public async addAccessForProject(request: ProjectAccessRequest): Promise<PermissionsResponse> {
    const projectAdmin = getProjectAdminRole(request.projectId);
    const projectResearcher = getResearcherRole(request.projectId);

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      request.dataSetId,
      [projectAdmin, projectResearcher],
      ['READ']
    );

    const permissionRequest: AddRemoveAccessPermissionRequest = {
      authenticatedUser: request.authenticatedUser,
      dataSetId: request.dataSetId,
      permission: {
        identity: projectAdmin,
        identityType: 'GROUP',
        accessLevel: request.accessLevel
      }
    };

    const response = await this.addAccessPermission(permissionRequest);

    const dataset: Associable = {
      type: SwbAuthZSubject.SWB_DATASET,
      id: request.dataSetId,
      data: {
        id: request.projectId,
        permission: request.accessLevel
      }
    };

    const project: Associable = {
      type: SwbAuthZSubject.SWB_PROJECT,
      id: request.projectId,
      data: {
        id: request.dataSetId,
        permission: request.accessLevel
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
      identityType: 'GROUP',
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
