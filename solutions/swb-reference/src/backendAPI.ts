/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { generateRouter, ApiRouteConfig } from '@aws/swb-app';
import { AuditService, BaseAuditPlugin } from '@aws/workbench-core-audit';
import { AwsService, AuditLogger } from '@aws/workbench-core-base';
import {
  DataSetService,
  S3DataSetStoragePlugin,
  DdbDataSetMetadataPlugin
} from '@aws/workbench-core-datasets';
import {
  HostingAccountService,
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService,
  ProjectService
} from '@aws/workbench-core-environments';
import { LoggingService } from '@aws/workbench-core-logging';
import { Express } from 'express';
import SagemakerNotebookEnvironmentConnectionService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentConnectionService';
import SagemakerNotebookEnvironmentLifecycleService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentLifecycleService';
import HPCService from './HPC/HPCService';

const logger: LoggingService = new LoggingService();
const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.STACK_NAME!
});

const apiRouteConfig: ApiRouteConfig = {
  routes: [
    {
      path: '/projects/:projectId/clusters/:clusterName',
      serviceAction: 'getAwsCluster',
      httpMethod: 'get',
      service: new HPCService()
    },
    {
      path: '/projects/:projectId/clusters',
      serviceAction: 'listAwsClusters',
      httpMethod: 'get',
      service: new HPCService()
    },
    {
      path: '/projects/:projectId/clusters/:clusterName/headNode/:instanceId/jobs',
      serviceAction: 'getJobQueue',
      httpMethod: 'get',
      service: new HPCService()
    },
    {
      path: '/projects/:projectId/clusters/:clusterName/headNode/:instanceId/jobs',
      serviceAction: 'submitJob',
      httpMethod: 'post',
      service: new HPCService()
    },
    {
      path: '/projects/:projectId/clusters/:clusterName/headNode/:instanceId/jobs/:jobId/cancel',
      serviceAction: 'cancelJob',
      httpMethod: 'put',
      service: new HPCService()
    }
  ],
  environments: {
    sagemakerNotebook: {
      lifecycle: new SagemakerNotebookEnvironmentLifecycleService(),
      connection: new SagemakerNotebookEnvironmentConnectionService()
    }

    // Add your environment types here as follows:
    // <newEnvTypeName>: {
    //   lifecycle: new <newEnvTypeName>EnvironmentLifecycleService(),
    //   connection: new <newEnvTypeName>EnvironmentConnectionService()
    // }
  },
  account: new HostingAccountService(),
  environmentService: new EnvironmentService({
    TABLE_NAME: process.env.STACK_NAME!
  }),
  dataSetService: new DataSetService(
    new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
    logger,
    new DdbDataSetMetadataPlugin(aws, 'DATASET', 'ENDPOINT')
  ),
  dataSetsStoragePlugin: new S3DataSetStoragePlugin(aws),
  allowedOrigins: JSON.parse(process.env.ALLOWED_ORIGINS || '[]'),
  environmentTypeService: new EnvironmentTypeService({
    TABLE_NAME: process.env.STACK_NAME!
  }),
  environmentTypeConfigService: new EnvironmentTypeConfigService({
    TABLE_NAME: process.env.STACK_NAME!
  }),
  projectService: new ProjectService({
    TABLE_NAME: process.env.STACK_NAME!
  })
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
