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
import { AuditService } from '@aws/workbench-core-audit';
import {
  CreateProvisionDatasetRequest,
  DataSetMetadataPlugin,
  DataSetsAuthorizationPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { LoggingService } from '@aws/workbench-core-logging';

export class DataSetService implements DataSetPlugin {
  public readonly storagePlugin: DataSetStoragePlugin;
  private _dataSetsAuthService: DataSetsAuthorizationPlugin;
  private _workbenchDataSetService: WorkbenchDataSetService;

  public constructor(
    dataSetStoragePlugin: DataSetStoragePlugin,
    auditService: AuditService,
    loggingService: LoggingService,
    dataSetMetadataPlugin: DataSetMetadataPlugin,
    dataSetAuthService: DataSetsAuthorizationPlugin
  ) {
    this._workbenchDataSetService = new WorkbenchDataSetService(
      auditService,
      loggingService,
      dataSetMetadataPlugin,
      dataSetAuthService
    );
    this.storagePlugin = dataSetStoragePlugin;
    this._dataSetsAuthService = dataSetAuthService;
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

  public provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    return this._workbenchDataSetService.provisionDataSet(request);
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
}
