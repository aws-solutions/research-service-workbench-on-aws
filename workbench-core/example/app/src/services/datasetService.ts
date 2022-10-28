/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@aws/workbench-core-audit';
import { AuditLogger } from '@aws/workbench-core-base';
import {
  DataSetService,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin
} from '@aws/workbench-core-datasets';
import { aws } from './awsService';
import { logger } from './loggingService';

const dataSetService: DataSetService = new DataSetService(
  new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
  logger,
  new DdbDataSetMetadataPlugin(aws, 'EXAMPLE-DS', 'EXAMPLE-EP')
);

const dataSetsStoragePlugin: S3DataSetStoragePlugin = new S3DataSetStoragePlugin(aws);

export { dataSetService, dataSetsStoragePlugin };
