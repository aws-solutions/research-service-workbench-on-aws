/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin, AuditLogger } from '@aws/workbench-core-audit';
import {
  DataSetService,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin
} from '@aws/workbench-core-datasets';
import { dataSetPrefix, endPointPrefix } from '../configs/constants';
import { datasetAws } from './awsService';
import { logger } from './loggingService';

const dataSetService: DataSetService = new DataSetService(
  new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
  logger,
  new DdbDataSetMetadataPlugin(datasetAws, dataSetPrefix, endPointPrefix)
);

const dataSetsStoragePlugin: S3DataSetStoragePlugin = new S3DataSetStoragePlugin(datasetAws);

export { dataSetService, dataSetsStoragePlugin };
