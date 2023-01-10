/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AddRemoveAccessPermissionRequest,
  CreateProvisionDatasetRequest,
  DataSet,
  DataSetExternalEndpointRequest,
  DataSetPlugin,
  DataSetStoragePlugin,
  GetAccessPermissionRequest,
  PermissionsResponse,
  PermissionsResponseParser
} from '@aws/swb-app';
import { AuditService } from '@aws/workbench-core-audit';
import { DynamicAuthorizationService } from '@aws/workbench-core-authorization';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import {
  DataSetMetadataPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { DataSetsAuthorizationPlugin } from '@aws/workbench-core-datasets/lib/dataSetsAuthorizationPlugin';
import { LoggingService } from '@aws/workbench-core-logging';
import { Associable, DatabaseServicePlugin } from './databaseService';

export class DataSetService implements DataSetPlugin {
  public readonly storagePlugin: DataSetStoragePlugin;
  private _dataSetsAuthService: DataSetsAuthorizationPlugin;
  private _workbenchDataSetService: WorkbenchDataSetService;
  private _databaseService: DatabaseServicePlugin;
  private _dynamicAuthService: DynamicAuthorizationService;

  public constructor(
    dataSetStoragePlugin: DataSetStoragePlugin,
    auditService: AuditService,
    loggingService: LoggingService,
    dataSetMetadataPlugin: DataSetMetadataPlugin,
    dataSetAuthService: DataSetsAuthorizationPlugin,
    databaseService: DatabaseServicePlugin,
    dynamicAuthService: DynamicAuthorizationService
  ) {
    this._workbenchDataSetService = new WorkbenchDataSetService(
      auditService,
      loggingService,
      dataSetMetadataPlugin,
      dataSetAuthService
    );
    this.storagePlugin = dataSetStoragePlugin;
    this._dataSetsAuthService = dataSetAuthService;
    this._databaseService = databaseService;
    this._dynamicAuthService = dynamicAuthService;
  }

  public addDataSetExternalEndpoint(
    request: DataSetExternalEndpointRequest
  ): Promise<Record<string, string>> {
    return this._workbenchDataSetService.addDataSetExternalEndpoint(
      request.dataSetId,
      request.externalEndpointName,
      this.storagePlugin,
      request.externalRoleName,
      request.kmsKeyArn,
      request.vpcId
    );
  }

  public getDataSet(dataSetId: string): Promise<DataSet> {
    return this._workbenchDataSetService.getDataSet(dataSetId);
  }

  public importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    return this._workbenchDataSetService.importDataSet(request);
  }

  public listDataSets(): Promise<DataSet[]> {
    return this._workbenchDataSetService.listDataSets();
  }

  public async provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    //add permissions in AuthZ for user to read, write, update, delete, and update read/write permissions
    const dataset = await this._workbenchDataSetService.provisionDataSet(request);
    const projectId = dataset.owner!;
    const projectAdmin = `${projectId}#PA`;

    await this._addAuthZCRUDPermissionsForDataset(
      'DATASET',
      dataset.id!,
      [projectAdmin],
      ['read', 'update', 'delete']
    );

    await this._addAuthZCRUDPermissionsForDataset(
      'DATASET_ACCESS_LEVELS',
      `${projectId}-${dataset.id!}`,
      [projectAdmin],
      ['read', 'update']
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
    const response = await this._dataSetsAuthService.removeAllAccessPermissions(datasetId);
    return PermissionsResponseParser.parse(response);
  }

  public async addAccessForProject(
    addAccessPermissionRequest: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse> {
    const datasetId = addAccessPermissionRequest.dataSetId;
    const projectId = addAccessPermissionRequest.permission.subject;
    const projectAdmin = `${projectId}#PA`;
    const projectResearcher = `${projectId}#Researcher`;

    await this._addAuthZPermissionsForDataset(
      'DATASET',
      datasetId,
      [projectAdmin, projectResearcher],
      ['read']
    );

    const response = await this.addAccessPermission(addAccessPermissionRequest);

    const dataset: Associable = {
      type: resourceTypeToKey.dataset,
      id: addAccessPermissionRequest.dataSetId,
      data: {
        id: projectId,
        permission: addAccessPermissionRequest.permission.accessLevel
      }
    };

    const project: Associable = {
      type: resourceTypeToKey.project,
      id: projectId,
      data: {
        id: addAccessPermissionRequest.dataSetId,
        permission: addAccessPermissionRequest.permission.accessLevel
      }
    };

    await this._databaseService.storeAssociations(dataset, [project]);

    return response;
  }

  private async _addAuthZPermissionsForDataset(
    subject: string,
    subjectId: string,
    roles: string[],
    actions: string[]
  ): Promise<void> {}
}
