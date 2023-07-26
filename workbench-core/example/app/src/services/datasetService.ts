/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DataSetService,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin,
  WbcDataSetsAuthorizationPlugin
} from '@aws/workbench-core-datasets';
import { dataSetPrefix, endpointPrefix, storageLocationPrefix } from '../configs/constants';
import { auditService } from './auditService';
import { datasetAws } from './awsService';
import { dynamicAuthorizationService } from './dynamicAuthorizationService';
import { logger } from './loggingService';

const dataSetService: DataSetService = new DataSetService(
  auditService,
  logger,
  new DdbDataSetMetadataPlugin(datasetAws, dataSetPrefix, endpointPrefix, storageLocationPrefix),
  new WbcDataSetsAuthorizationPlugin(dynamicAuthorizationService)
);

const dataSetsStoragePlugin: S3DataSetStoragePlugin = new S3DataSetStoragePlugin(datasetAws);

export { dataSetService, dataSetsStoragePlugin };
