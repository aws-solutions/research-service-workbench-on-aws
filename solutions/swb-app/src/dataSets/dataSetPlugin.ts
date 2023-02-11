/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AddRemoveAccessPermissionRequest } from '@aws/workbench-core-datasets';
import { AuthenticatedUser } from '../users/authenticatedUser';
import { CreateProvisionDatasetRequest } from './createProvisionDatasetRequest';
import { DataSet } from './dataSet';
import { DataSetAddExternalEndpointResponse } from './dataSetAddExternalEndpointResponseParser';
import { DataSetExternalEndpointRequest } from './dataSetExternalEndpointRequest';
import { DataSetStoragePlugin } from './dataSetStoragePlugin';
import { GetAccessPermissionRequest } from './getAccessPermissionRequestParser';
import { PermissionsResponse } from './permissionsResponseParser';
import { ProjectAccessRequest } from './projectAccessRequestParser';

export interface DataSetPlugin {
  storagePlugin: DataSetStoragePlugin;

  provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  addDataSetExternalEndpoint(
    request: DataSetExternalEndpointRequest
  ): Promise<DataSetAddExternalEndpointResponse>;
  getDataSet(dataSetId: string, authenticatedUser: AuthenticatedUser): Promise<DataSet>;
  listDataSets(): Promise<DataSet[]>;

  addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;
  getAccessPermissions(params: GetAccessPermissionRequest): Promise<PermissionsResponse>;
  removeAccessPermissions(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;
  getAllDataSetAccessPermissions(datasetId: string): Promise<PermissionsResponse>;
  removeAllAccessPermissions(datasetId: string): Promise<PermissionsResponse>;

  addAccessForProject(request: ProjectAccessRequest): Promise<PermissionsResponse>;
}
