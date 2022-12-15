/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateProvisionDatasetRequest,
  DataSet,
  DataSetExternalEndpointRequest,
  DataSetPlugin,
  DataSetStoragePlugin
} from '@aws/swb-app';
import { AuditService } from '@aws/workbench-core-audit';
import {
  DataSetMetadataPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { LoggingService } from '@aws/workbench-core-logging';

export class DataSetService implements DataSetPlugin {
  public readonly storagePlugin: DataSetStoragePlugin;
  private _workbenchDataSetService: WorkbenchDataSetService;

  public constructor(
    dataSetStoragePlugin: DataSetStoragePlugin,
    auditService: AuditService,
    loggingService: LoggingService,
    dataSetMetadataPlugin: DataSetMetadataPlugin
  ) {
    this._workbenchDataSetService = new WorkbenchDataSetService(
      auditService,
      loggingService,
      dataSetMetadataPlugin
    );
    this.storagePlugin = dataSetStoragePlugin;
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

  public provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    return this._workbenchDataSetService.provisionDataSet(request);
  }
}
