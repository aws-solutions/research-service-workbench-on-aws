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
  DDBDynamicAuthorizationPermissionsPlugin,
  CASLAuthorizationPlugin
} from '@aws/workbench-core-authorization';
import { AwsService, MetadataService } from '@aws/workbench-core-base';
import {
  S3DataSetStoragePlugin,
  DdbDataSetMetadataPlugin,
  WbcDataSetsAuthorizationPlugin
} from '@aws/workbench-core-datasets';
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
import KeyPairService from './services/keyPairService';
import { ProjectEnvTypeConfigService } from './services/projectEnvTypeConfigService';

const requiredAuditValues: string[] = ['actor', 'source'];
const fieldsToMask: string[] = JSON.parse(process.env.FIELDS_TO_MASK_WHEN_AUDITING!);

const logger: LoggingService = new LoggingService();
const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.STACK_NAME!
});

// Dynamic Auth
const dynamicAuthAws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.DYNAMIC_AUTH_DDB_TABLE_NAME!
});

const wbcGroupManagementPlugin: WBCGroupManagementPlugin = new WBCGroupManagementPlugin({
  userManagementService: new UserManagementService(
    new CognitoUserManagementPlugin(process.env.USER_POOL_ID!, aws)
  ),
  ddbService: dynamicAuthAws.helpers.ddb,
  userGroupKeyType: authorizationGroupPrefix
});
const ddbDynamicAuthorizationPermissionsPlugin: DDBDynamicAuthorizationPermissionsPlugin =
  new DDBDynamicAuthorizationPermissionsPlugin({
    dynamoDBService: dynamicAuthAws.helpers.ddb
  });
const caslAuthorizationPlugin: CASLAuthorizationPlugin = new CASLAuthorizationPlugin();
const dynamicAuthorizationService: DynamicAuthorizationService = new DynamicAuthorizationService({
  groupManagementPlugin: wbcGroupManagementPlugin,
  dynamicAuthorizationPermissionsPlugin: ddbDynamicAuthorizationPermissionsPlugin,
  auditService: new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
  authorizationPlugin: caslAuthorizationPlugin
});

const accountService: AccountService = new AccountService(aws.helpers.ddb);
const envTypeService: EnvironmentTypeService = new EnvironmentTypeService(aws.helpers.ddb);
const envTypeConfigService: EnvironmentTypeConfigService = new EnvironmentTypeConfigService(
  envTypeService,
  aws.helpers.ddb
);
const metadataService: MetadataService = new MetadataService(aws.helpers.ddb);
const costCenterService: CostCenterService = new CostCenterService(aws.helpers.ddb);
const projectService: ProjectService = new ProjectService(
  aws.helpers.ddb,
  dynamicAuthorizationService,
  costCenterService
);

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
    new AuditService(new BaseAuditPlugin(new AuditLogger(logger)), true, requiredAuditValues, fieldsToMask),
    logger,
    new DdbDataSetMetadataPlugin(aws, dataSetPrefix, endPointPrefix),
    new WbcDataSetsAuthorizationPlugin(dynamicAuthorizationService)
  ),
  allowedOrigins: JSON.parse(process.env.ALLOWED_ORIGINS || '[]'),
  environmentTypeService: envTypeService,
  environmentTypeConfigService: envTypeConfigService,
  projectService,
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
  ),
  keyPairService: new KeyPairService(aws.helpers.ddb),
  authorizationService: dynamicAuthorizationService
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
