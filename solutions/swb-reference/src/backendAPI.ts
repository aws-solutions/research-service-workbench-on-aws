/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { generateRouter, ApiRouteConfig } from '@aws/swb-app';
import {
  AccountService,
  CostCenterService,
  HostingAccountLifecycleService,
  HostingAccountService,
  ProjectService
} from '@aws/workbench-core-accounts';
import { AuditService, AuditLogger, BaseAuditPlugin } from '@aws/workbench-core-audit';
import { AwsService, MetadataService } from '@aws/workbench-core-base';
import { S3DataSetStoragePlugin, DdbDataSetMetadataPlugin } from '@aws/workbench-core-datasets';
import {
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService
} from '@aws/workbench-core-environments';
import { LoggingService } from '@aws/workbench-core-logging';
import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-user-management';
import { Express } from 'express';
import SagemakerNotebookEnvironmentConnectionService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentConnectionService';
import SagemakerNotebookEnvironmentLifecycleService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentLifecycleService';
import { DataSetService } from './services/dataSetService';

const logger: LoggingService = new LoggingService();
const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.STACK_NAME!
});
const accountService: AccountService = new AccountService(aws.helpers.ddb);

const apiRouteConfig: ApiRouteConfig = {
  routes: [
    {
      path: '/foo',
      serviceAction: 'launch',
      httpMethod: 'post',
      service: new SagemakerNotebookEnvironmentLifecycleService()
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
  account: new HostingAccountService(
    new HostingAccountLifecycleService(process.env.STACK_NAME!, aws, accountService)
  ),
  environmentService: new EnvironmentService(aws.helpers.ddb),
  dataSetService: new DataSetService(
    new S3DataSetStoragePlugin(aws),
    new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
    logger,
    new DdbDataSetMetadataPlugin(aws, 'DATASET', 'ENDPOINT')
  ),
  allowedOrigins: JSON.parse(process.env.ALLOWED_ORIGINS || '[]'),
  environmentTypeService: new EnvironmentTypeService(aws.helpers.ddb),
  environmentTypeConfigService: new EnvironmentTypeConfigService(
    new EnvironmentTypeService(aws.helpers.ddb),
    aws.helpers.ddb
  ),
  projectService: new ProjectService({
    TABLE_NAME: process.env.STACK_NAME!
  }),
  userManagementService: new UserManagementService(
    new CognitoUserManagementPlugin(process.env.USER_POOL_ID!, aws)
  ),
  costCenterService: new CostCenterService(aws.helpers.ddb),
  metadataService: new MetadataService(aws.helpers.ddb)
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
