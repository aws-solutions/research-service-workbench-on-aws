/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  ConflictError,
  DataSet,
  DataSetAddExternalEndpointResponse,
  DataSetExternalEndpointRequest,
  DataSetPlugin,
  DataSetStoragePlugin,
  GetAccessPermissionRequest,
  IsProjectAuthorizedForDatasetsRequest,
  PermissionsResponse,
  PermissionsResponseParser
} from '@aws/swb-app';
import { ListDataSetAccessPermissionsRequest } from '@aws/swb-app/lib/dataSets/listDataSetAccessPermissionsRequestParser';
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
import { PaginatedResponse, resourceTypeToKey } from '@aws/workbench-core-base';
import {
  AddRemoveAccessPermissionRequest,
  CreateProvisionDatasetRequest,
  DataSetsAuthorizationPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { SwbAuthZSubject } from '../constants';
import { getProjectAdminRole, getResearcherRole } from '../utils/roleUtils';
import { Associable, DatabaseServicePlugin } from './databaseService';

const timeToLiveSeconds: number = 60 * 2; // 2 min
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

    const associatedProjects = await this._associatedProjects(dataset);
    if (associatedProjects.length > 0) {
      throw new ConflictError(
        `DataSet cannot be removed because it is still associated with roles in the provided project(s)`
      );
    }

    await this._workbenchDataSetService.removeDataSet(
      dataSetId,
      () => {
        return Promise.resolve();
      },
      authenticatedUser
    );

    const projectId = dataset.owner!.split('#')[0];

    const projectAdmin = getProjectAdminRole(projectId);
    await this._removeAuthZPermissionsForDataset(
      authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      dataSetId,
      [projectAdmin],
      ['READ', 'UPDATE', 'DELETE']
    );
    await this._removeAuthZPermissionsForDataset(
      authenticatedUser,
      SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
      `${dataSetId!}`,
      [projectAdmin],
      ['READ', 'UPDATE', 'DELETE']
    );

    const researcher = getResearcherRole(projectId);
    await this._removeAuthZPermissionsForDataset(
      authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      dataSetId,
      [researcher],
      ['READ']
    );
    await this._removeAuthZPermissionsForDataset(
      authenticatedUser,
      SwbAuthZSubject.SWB_DATASET_UPLOAD,
      dataSetId,
      [projectAdmin, researcher],
      ['READ']
    );
  }

  private async _associatedProjects(dataset: DataSet): Promise<string[]> {
    const permissions = await this._dynamicAuthService.getIdentityPermissionsBySubject({
      subjectId: dataset.id!,
      subjectType: SwbAuthZSubject.SWB_DATASET
    });

    const projectIds = permissions.data.identityPermissions
      .filter((permission) => permission.identityType === 'GROUP')
      .filter((permission) => permission.identityId.split('#')[0] !== dataset.owner!.split('#')[0])
      .map((permission) => `'${permission.identityId.split('#')[0]}'`);

    return Array.from(new Set(projectIds));
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

  public listDataSets(
    user: AuthenticatedUser,
    pageSize: number,
    paginationToken: string | undefined
  ): Promise<PaginatedResponse<DataSet>> {
    return this._workbenchDataSetService.listDataSets(user, pageSize, paginationToken);
  }

  public async listDataSetsForProject(
    projectId: string,
    user: AuthenticatedUser,
    pageSize: number,
    paginationToken: string | undefined
  ): Promise<PaginatedResponse<DataSet>> {
    let projectDatasets: DataSet[] = [];

    if (user.roles.includes('ITAdmin')) {
      return {
        data: [],
        paginationToken: undefined
      };
    }

    let lastPaginationToken = paginationToken;
    do {
      const dataSetsOnPageResponse = await this._workbenchDataSetService.listDataSets(
        user,
        pageSize,
        lastPaginationToken
      );
      projectDatasets = projectDatasets.concat(
        dataSetsOnPageResponse.data.filter((dataset) => dataset.owner?.split('#')[0] === projectId)
      );
      lastPaginationToken = dataSetsOnPageResponse.paginationToken;
    } while (projectDatasets.length < pageSize && lastPaginationToken);

    if (projectDatasets.length > pageSize) {
      projectDatasets = projectDatasets.slice(0, pageSize);
      lastPaginationToken = this._workbenchDataSetService.getPaginationToken(
        projectDatasets[pageSize - 1].id
      );
    }

    return {
      data: projectDatasets,
      paginationToken: lastPaginationToken
    };
  }

  public async listDataSetAccessPermissions(
    request: ListDataSetAccessPermissionsRequest
  ): Promise<PermissionsResponse> {
    const response = await this._workbenchDataSetService.getAllDataSetAccessPermissions(
      request.dataSetId,
      request.authenticatedUser,
      request.paginationToken,
      request.pageSize
    );

    return PermissionsResponseParser.parse(response);
  }

  public async provisionDataSet(projectId: string, request: CreateProvisionDatasetRequest): Promise<DataSet> {
    //add permissions in AuthZ for user to read, write, update, delete, and update read/write permissions
    const projectAdmin = getProjectAdminRole(projectId);
    const projectResearcher = getResearcherRole(projectId);

    request.ownerType = 'GROUP';
    request.owner = projectAdmin;
    request.permissions = [
      {
        identity: projectAdmin,
        identityType: 'GROUP',
        accessLevel: 'read-write'
      },
      {
        identity: projectResearcher,
        identityType: 'GROUP',
        accessLevel: 'read-write'
      }
    ];

    const dataset = await this._workbenchDataSetService.provisionDataSet(request);

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      dataset.id!,
      [projectAdmin],
      ['READ', 'UPDATE', 'DELETE'],
      { projectId: { $eq: projectId } }
    );

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      dataset.id!,
      [projectResearcher],
      ['READ'],
      { projectId: { $eq: projectId } }
    );

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL,
      `${dataset.id!}`,
      [projectAdmin],
      ['READ', 'UPDATE', 'DELETE']
    );

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET_UPLOAD,
      dataset.id!,
      [projectAdmin, projectResearcher],
      ['READ'],
      { projectId: { $eq: projectId } }
    );

    return dataset;
  }

  public async getSinglePartFileUploadUrl(
    dataSetId: string,
    fileName: string,
    authenticatedUser: AuthenticatedUser
  ): Promise<string> {
    return this._workbenchDataSetService.getPresignedSinglePartUploadUrl(
      dataSetId,
      fileName,
      timeToLiveSeconds,
      this.storagePlugin,
      authenticatedUser
    );
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
    const requestedDataset = await this.getDataSet(request.dataSetId, request.authenticatedUser);
    if (requestedDataset.owner === projectAdmin) {
      throw new ConflictError(`Project already owns this dataset`);
    }

    const dataset: Associable = {
      type: resourceTypeToKey.dataset,
      id: request.dataSetId,
      data: {
        id: request.projectId,
        permission: request.accessLevel
      }
    };

    const project: Associable = {
      type: resourceTypeToKey.project,
      id: request.projectId,
      data: {
        id: request.dataSetId,
        permission: request.accessLevel
      }
    };

    const existingAssociation = await this._databaseService.getAssociation(dataset, project);

    if (existingAssociation) {
      throw new ConflictError(`Project is already associated with Dataset`);
    }

    await this._addAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      request.dataSetId,
      [projectAdmin, projectResearcher],
      ['READ'],
      { projectId: { $eq: request.projectId } }
    );

    const permissionRequest: AddRemoveAccessPermissionRequest = {
      authenticatedUser: request.authenticatedUser,
      dataSetId: request.dataSetId,
      permission: [
        {
          identity: projectAdmin,
          identityType: 'GROUP',
          accessLevel: request.accessLevel
        },
        {
          identity: projectResearcher,
          identityType: 'GROUP',
          accessLevel: request.accessLevel
        }
      ]
    };

    const response = await this.addAccessPermission(permissionRequest);

    if (request.accessLevel === 'read-write') {
      await this._addAuthZPermissionsForDataset(
        request.authenticatedUser,
        SwbAuthZSubject.SWB_DATASET_UPLOAD,
        request.dataSetId,
        [projectAdmin, projectResearcher],
        ['READ'],
        { projectId: { $eq: request.projectId } }
      );
    }

    await this._databaseService.storeAssociations(dataset, [project]);

    return response;
  }

  public async removeAccessForProject(request: ProjectRemoveAccessRequest): Promise<PermissionsResponse> {
    const reqDataset = await this.getDataSet(request.dataSetId, request.authenticatedUser);
    const projectId = request.projectId;
    const projectAdmin = getProjectAdminRole(projectId);

    // Make sure you're not removing the access for your project
    if (projectAdmin === reqDataset.owner) {
      throw new ConflictError(
        `Requested project cannot remove access from dataset for the ProjectAdmin because it owns that dataset.`
      );
    }

    const project: Associable = {
      type: resourceTypeToKey.project,
      id: projectId
    };

    // Make sure project has no environments with dataset mounted
    const projDatasetEndpointAssociations = await this._databaseService.listAssociations(
      project,
      `${resourceTypeToKey.dataset}#${request.dataSetId}${resourceTypeToKey.endpoint}`,
      { pageSize: 1 }
    );

    if (projDatasetEndpointAssociations.data.length > 0) {
      throw new ConflictError(
        `Project still has environments with dataset mounted. ` +
          'Terminate environments before removing access.'
      );
    }

    const projectResearcher = getResearcherRole(projectId);

    await this._removeAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET,
      request.dataSetId,
      [projectAdmin, projectResearcher],
      ['READ']
    );

    await this._removeAuthZPermissionsForDataset(
      request.authenticatedUser,
      SwbAuthZSubject.SWB_DATASET_UPLOAD,
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
      type: resourceTypeToKey.dataset,
      id: request.dataSetId
    };

    await this._databaseService.removeAssociations(dataset, [project]);

    return response;
  }

  public async isProjectAuthorizedForDatasets(
    request: IsProjectAuthorizedForDatasetsRequest
  ): Promise<boolean> {
    let authorizedDataset = true;
    await Promise.all(
      request.datasetIds.map(async (datasetId: string): Promise<void> => {
        // Using Researcher role to verify project has access to dataset because Researcher and PA permissions
        // are coupled together in regard to datasets
        const accessPermissions = await this.getAccessPermissions({
          dataSetId: datasetId,
          identity: `${request.projectId}#Researcher`,
          identityType: 'GROUP'
        });
        if (accessPermissions.data.permissions.length === 0) {
          authorizedDataset = false;
        }
      })
    );
    return authorizedDataset;
  }

  private async _addAuthZPermissionsForDataset(
    authenticatedUser: AuthenticatedUser,
    subject: string,
    subjectId: string,
    roles: string[],
    actions: Action[],
    conditions?: object
  ): Promise<void> {
    let partialIdentityPermission = {
      action: undefined,
      effect: 'ALLOW',
      identityId: undefined,
      identityType: 'GROUP',
      subjectId: subjectId,
      subjectType: subject
    };

    if (conditions) {
      partialIdentityPermission = { ...partialIdentityPermission, ...{ conditions: conditions } };
    }

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
