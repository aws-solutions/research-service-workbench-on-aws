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
import { ProjectAddAccessRequest } from '@aws/swb-app/lib/dataSets/projectAddAccessRequestParser';
import { ProjectRemoveAccessRequest } from '@aws/swb-app/lib/dataSets/projectRemoveAccessRequestParser';
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

  public async removeDataSet(dataSetId: string, authenticatedUser: AuthenticatedUser): Promise<void> {
    const dataset = await this.getDataSet(dataSetId, authenticatedUser);

    const associatedProjects = await this._associatedProjects(dataSetId);
    if (associatedProjects.length > 0) {
      throw Error(
        `DataSet cannot be removed because it is associated with project(s) [${associatedProjects.join(',')}]`
      );
    }

    const projectAdmin = dataset.owner!;

    await this._workbenchDataSetService.removeDataSet(
      dataSetId,
      () => {
        return Promise.resolve();
      },
      authenticatedUser
    );

    await this._removeAuthZPermissionsForDataset(
      authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      dataSetId,
      [projectAdmin],
      ['READ', 'UPDATE', 'DELETE']
    );

    const projectId = projectAdmin.split('#')[0];
    await this._removeAuthZPermissionsForDataset(
      authenticatedUser,
      SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
      `${projectId}-${dataSetId!}`,
      [projectAdmin],
      ['READ', 'UPDATE']
    );
  }

  private async _associatedProjects(dataSetId: string): Promise<string[]> {
    const permissions = await this._dynamicAuthService.getIdentityPermissionsBySubject({
      subjectId: dataSetId,
      subjectType: SwbAuthZSubject.SWB_DATASET
    });

    return permissions.data.identityPermissions
      .filter((permission) => permission.identityType === 'GROUP')
      .map((permission) => `'${permission.identityId.split('#')[0]}'`);
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

  public listDataSets(user: AuthenticatedUser): Promise<DataSet[]> {
    return this._workbenchDataSetService.listDataSets(user);
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

  public async removeAllAccessPermissions(
    datasetId: string,
    authenticatedUser: AuthenticatedUser
  ): Promise<PermissionsResponse> {
    const response = await this._dataSetsAuthService.removeAllAccessPermissions(datasetId, authenticatedUser);
    return PermissionsResponseParser.parse(response);
  }

  public async addAccessForProject(request: ProjectAddAccessRequest): Promise<PermissionsResponse> {
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

  public async removeAccessForProject(request: ProjectRemoveAccessRequest): Promise<PermissionsResponse> {
    const projectAdmin = getProjectAdminRole(request.projectId);

    //Make sure you're not removing the access for your project
    if (request.authenticatedUser.roles.includes(projectAdmin)) {
      throw new Error(
        `${request.projectId} cannot remove access from ${request.dataSetId} for the ProjectAdmin because it owns that dataset.`
      );
    }

    const projectResearcher = getResearcherRole(request.projectId);

    await this._removeAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      request.dataSetId,
      [projectAdmin, projectResearcher],
      ['READ']
    );

    // `read-write` will cause the read and write permissions to get removed,
    // so there is no need to pass in `read-only` when removing access.
    const accessLevel = 'read-write';
    const readWriteDeletionRequest: AddRemoveAccessPermissionRequest = {
      authenticatedUser: request.authenticatedUser,
      dataSetId: request.dataSetId,
      permission: [
        {
          identity: projectAdmin,
          identityType: 'GROUP',
          accessLevel
        },
        {
          identity: projectResearcher,
          identityType: 'GROUP',
          accessLevel
        }
      ]
    };
    const response = await this.removeAccessPermissions(readWriteDeletionRequest);

    const dataset: Associable = {
      type: SwbAuthZSubject.SWB_DATASET,
      id: request.dataSetId
    };

    const project: Associable = {
      type: SwbAuthZSubject.SWB_PROJECT,
      id: request.projectId
    };

    await this._databaseService.removeAssociations(dataset, [project]);

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

  private async _removeAuthZPermissionsForDataset(
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

    await this._dynamicAuthService.deleteIdentityPermissions(createRequest);
  }
}
