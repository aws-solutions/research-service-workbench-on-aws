/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AddRemoveAccessPermissionRequest } from './addRemoveAccessPermissionRequest';
import { CreateProvisionDatasetRequest } from './createProvisionDatasetRequest';
import { DataSet } from './dataSet';
import { DataSetExternalEndpointRequest } from './dataSetExternalEndpointRequest';
import { DataSetStoragePlugin } from './dataSetStoragePlugin';
import { GetAccessPermissionRequest } from './getAccessPermissionRequestParser';
import { PermissionsResponse } from './permissionsResponseParser';

export interface DataSetPlugin {
  storagePlugin: DataSetStoragePlugin;

  provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  addDataSetExternalEndpoint(request: DataSetExternalEndpointRequest): Promise<Record<string, string>>;
  getDataSet(dataSetId: string): Promise<DataSet>;
  listDataSets(): Promise<DataSet[]>;

  addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;
  getAccessPermissions(params: GetAccessPermissionRequest): Promise<PermissionsResponse>;
  removeAccessPermissions(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;
  getAllDataSetAccessPermissions(datasetId: string): Promise<PermissionsResponse>;
  removeAllAccessPermissions(datasetId: string): Promise<PermissionsResponse>;

  associateProjectWithDataSet(
    addAccessPermissionRequest: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse>;
}
