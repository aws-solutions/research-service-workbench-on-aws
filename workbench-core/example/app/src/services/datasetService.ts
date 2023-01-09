/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin, AuditLogger } from '@aws/workbench-core-audit';
import {
  DataSetsAuthorizationPlugin,
  DataSetService,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin
  // WbcDataSetsAuthorizationPlugin
} from '@aws/workbench-core-datasets';
import { dataSetPrefix, endPointPrefix } from '../configs/constants';
import { datasetAws } from './awsService';
// import { dynamicAuthorizationService } from './dynamicAuthorizationService';
import { logger } from './loggingService';

const fakeDataSetsAuthorizationPlugin: DataSetsAuthorizationPlugin = {
  addAccessPermission: (params) => {
    throw new Error('Not Implemented');
  },
  getAccessPermissions: ({ dataSetId, subject }) => {
    return Promise.resolve({
      data: {
        dataSetId,
        permissions: [{ identity: subject, identityType: 'USER', accessLevel: 'read-write' }]
      }
    });
  },
  removeAccessPermissions: (params) => {
    throw new Error('Not Implemented');
  },
  getAllDataSetAccessPermissions: (datasetId) => {
    throw new Error('Not Implemented');
  },
  removeAllAccessPermissions: (datasetId) => {
    throw new Error('Not Implemented');
  }
};

const dataSetService: DataSetService = new DataSetService(
  new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
  logger,
  new DdbDataSetMetadataPlugin(datasetAws, dataSetPrefix, endPointPrefix),
  fakeDataSetsAuthorizationPlugin //new WbcDataSetsAuthorizationPlugin(dynamicAuthorizationService)
);

const dataSetsStoragePlugin: S3DataSetStoragePlugin = new S3DataSetStoragePlugin(datasetAws);

export { dataSetService, dataSetsStoragePlugin };
