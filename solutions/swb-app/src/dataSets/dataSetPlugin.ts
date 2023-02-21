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
import { ListDataSetAccessPermissionsRequest } from './listDataSetAccessPermissionsRequestParser';
import { PermissionsResponse } from './permissionsResponseParser';
import { ProjectAddAccessRequest } from './projectAddAccessRequestParser';
import { ProjectRemoveAccessRequest } from './projectRemoveAccessRequestParser';

export interface DataSetPlugin {
  storagePlugin: DataSetStoragePlugin;

  provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  removeDataSet(dataSetId: string, authenticatedUser: AuthenticatedUser): Promise<void>;
  importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  addDataSetExternalEndpoint(
    request: DataSetExternalEndpointRequest
  ): Promise<DataSetAddExternalEndpointResponse>;
  getDataSet(dataSetId: string, authenticatedUser: AuthenticatedUser): Promise<DataSet>;
  listDataSets(user: AuthenticatedUser): Promise<DataSet[]>;
  listDataSetAccessPermissions(request: ListDataSetAccessPermissionsRequest): Promise<PermissionsResponse>;
  getSinglePartFileUploadUrl(
    dataSetId: string,
    fileName: string,
    authenticatedUser: AuthenticatedUser
  ): Promise<string>;

  addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;
  getAccessPermissions(params: GetAccessPermissionRequest): Promise<PermissionsResponse>;
  removeAccessPermissions(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;
  getAllDataSetAccessPermissions(datasetId: string): Promise<PermissionsResponse>;
  removeAllAccessPermissions(
    datasetId: string,
    authenticatedUser: AuthenticatedUser
  ): Promise<PermissionsResponse>;

  addAccessForProject(request: ProjectAddAccessRequest): Promise<PermissionsResponse>;
  removeAccessForProject(request: ProjectRemoveAccessRequest): Promise<PermissionsResponse>;
}
