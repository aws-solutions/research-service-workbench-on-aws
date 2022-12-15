/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateProvisionDatasetRequest } from './createProvisionDatasetRequest';
import { DataSet } from './dataSet';
import { DataSetExternalEndpointRequest } from './dataSetExternalEndpointRequest';
import { DataSetStoragePlugin } from './dataSetStoragePlugin';

export interface DataSetPlugin {
  storagePlugin: DataSetStoragePlugin;

  provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  addDataSetExternalEndpoint(request: DataSetExternalEndpointRequest): Promise<Record<string, string>>;
  getDataSet(dataSetId: string): Promise<DataSet>;
  listDataSets(): Promise<DataSet[]>;
}
