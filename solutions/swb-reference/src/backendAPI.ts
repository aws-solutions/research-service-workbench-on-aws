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
import {
  DynamicAuthorizationService,
  WBCGroupManagementPlugin,
  DDBDynamicAuthorizationPermissionsPlugin
} from '@aws/workbench-core-authorization';
import { AwsService, MetadataService } from '@aws/workbench-core-base';
import { S3DataSetStoragePlugin, DdbDataSetMetadataPlugin } from '@aws/workbench-core-datasets';
import { DataSetsAuthorizationPlugin } from '@aws/workbench-core-datasets/lib/dataSetsAuthorizationPlugin';
import {
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService
} from '@aws/workbench-core-environments';
import { LoggingService } from '@aws/workbench-core-logging';
import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-user-management';
import { Express } from 'express';
import { authorizationGroupPrefix, dataSetPrefix, endPointPrefix } from './constants';
import SagemakerNotebookEnvironmentConnectionService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentConnectionService';
import SagemakerNotebookEnvironmentLifecycleService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentLifecycleService';
import { DataSetService } from './services/dataSetService';
import { ProjectEnvTypeConfigService } from './services/projectEnvTypeConfigService';

const logger: LoggingService = new LoggingService();
const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.STACK_NAME!
});

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
    new DdbDataSetMetadataPlugin(aws, dataSetPrefix, endPointPrefix),
    {} as DataSetsAuthorizationPlugin //TODO: REPLACE WITH ACTUAL IMPLEMENTATION ONCE ITS AVAILABLE
  ),
  allowedOrigins: JSON.parse(process.env.ALLOWED_ORIGINS || '[]'),
  environmentTypeService: envTypeService,
  environmentTypeConfigService: envTypeConfigService,
  projectService: projectService,
  userManagementService: new UserManagementService(
    new CognitoUserManagementPlugin(process.env.USER_POOL_ID!, aws)
  ),
  costCenterService: new CostCenterService(aws.helpers.ddb),
  metadataService: metadataService,
  projectEnvTypeConfigPlugin: new ProjectEnvTypeConfigService(
    metadataService,
    projectService,
    envTypeConfigService,
    envTypeService
  )
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
