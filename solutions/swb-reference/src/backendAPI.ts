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
  DynamicRoutesMap,
  RoutesIgnored,
  DynamicAuthorizationService,
  WBCGroupManagementPlugin,
  DDBDynamicAuthorizationPermissionsPlugin,
  CASLAuthorizationPlugin
} from '@aws/workbench-core-authorization';
import { AwsService, MetadataService } from '@aws/workbench-core-base';
import {
  DataSetService as WorkbenchDataSetService,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin,
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
import { authorizationGroupPrefix, dataSetPrefix, endPointPrefix, storageLocationPrefix } from './constants';
import * as DynamicRouteConfig from './dynamicRouteConfig';
import SagemakerNotebookEnvironmentConnectionService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentConnectionService';
import SagemakerNotebookEnvironmentLifecycleService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentLifecycleService';
import { DatabaseService } from './services/databaseService';
import { DataSetService } from './services/dataSetService';
import { EnvTypeConfigService } from './services/envTypeConfigService';
import { ProjectEnvService } from './services/projectEnvService';
import { ProjectEnvTypeConfigService } from './services/projectEnvTypeConfigService';
import SshKeyService from './services/sshKeyService';
import { SWBEnvironmentService } from './services/swbEnvironmentService';
import { SWBProjectService } from './services/swbProjectService';

const requiredAuditValues: string[] = ['actor', 'source'];
const fieldsToMask: string[] = JSON.parse(process.env.FIELDS_TO_MASK_WHEN_AUDITING!);

const logger: LoggingService = new LoggingService();
const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  userAgent: process.env.USER_AGENT_STRING,
  ddbTableName: process.env.STACK_NAME!
});

// Dynamic Auth
const dynamicAuthAws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  userAgent: process.env.USER_AGENT_STRING,
  ddbTableName: process.env.DYNAMIC_AUTH_DDB_TABLE_NAME!
});
const cognitoUserManagementPlugin: CognitoUserManagementPlugin = new CognitoUserManagementPlugin(
  process.env.USER_POOL_ID!,
  aws,
  {
    ddbService: dynamicAuthAws.helpers.ddb,
    ttl: 60 * 60
  }
);
const userManagementService: UserManagementService = new UserManagementService(cognitoUserManagementPlugin);
const wbcGroupManagementPlugin: WBCGroupManagementPlugin = new WBCGroupManagementPlugin({
  userManagementService,
  ddbService: dynamicAuthAws.helpers.ddb,
  userGroupKeyType: authorizationGroupPrefix
});
const dynamicRoutesMap: DynamicRoutesMap = DynamicRouteConfig.dynamicRoutesMap;
const routesIgnored: RoutesIgnored = DynamicRouteConfig.routesIgnored;
const ddbDynamicAuthorizationPermissionsPlugin: DDBDynamicAuthorizationPermissionsPlugin =
  new DDBDynamicAuthorizationPermissionsPlugin({
    dynamoDBService: dynamicAuthAws.helpers.ddb,
    dynamicRoutesMap,
    routesIgnored
  });
const caslAuthorizationPlugin: CASLAuthorizationPlugin = new CASLAuthorizationPlugin();
const dynamicAuthorizationService: DynamicAuthorizationService = new DynamicAuthorizationService({
  groupManagementPlugin: wbcGroupManagementPlugin,
  dynamicAuthorizationPermissionsPlugin: ddbDynamicAuthorizationPermissionsPlugin,
  auditService: new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
  authorizationPlugin: caslAuthorizationPlugin
});

const accountService: AccountService = new AccountService(aws.helpers.ddb);
const environmentService: EnvironmentService = new EnvironmentService(aws.helpers.ddb);
const envTypeService: EnvironmentTypeService = new EnvironmentTypeService(aws.helpers.ddb);
const envTypeConfigService: EnvironmentTypeConfigService = new EnvironmentTypeConfigService(
  envTypeService,
  aws.helpers.ddb
);
const metadataService: MetadataService = new MetadataService(aws.helpers.ddb);
const costCenterService: CostCenterService = new CostCenterService(aws.helpers.ddb);
const projectService: ProjectService = new ProjectService(aws.helpers.ddb, costCenterService);

const apiRouteConfig: ApiRouteConfig = {
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
  dataSetService: new DataSetService(
    new S3DataSetStoragePlugin(aws),
    new WorkbenchDataSetService(
      new AuditService(new BaseAuditPlugin(new AuditLogger(logger)), true, requiredAuditValues, fieldsToMask),
      logger,
      new DdbDataSetMetadataPlugin(aws, dataSetPrefix, endPointPrefix, storageLocationPrefix),
      new WbcDataSetsAuthorizationPlugin(dynamicAuthorizationService)
    ),
    new WbcDataSetsAuthorizationPlugin(dynamicAuthorizationService),
    new DatabaseService(),
    dynamicAuthorizationService
  ),
  allowedOrigins: JSON.parse(process.env.ALLOWED_ORIGINS || '[]'),
  environmentService,
  environmentPlugin: new SWBEnvironmentService(environmentService),
  environmentTypeService: envTypeService,
  environmentTypeConfigService: new EnvTypeConfigService(envTypeConfigService, metadataService),
  userManagementService: userManagementService,
  costCenterService: new CostCenterService(aws.helpers.ddb),
  metadataService: metadataService,
  projectEnvPlugin: new ProjectEnvService(dynamicAuthorizationService, environmentService, projectService),
  projectEnvTypeConfigPlugin: new ProjectEnvTypeConfigService(
    metadataService,
    projectService,
    envTypeConfigService,
    envTypeService,
    environmentService,
    dynamicAuthorizationService
  ),
  projectPlugin: new SWBProjectService(dynamicAuthorizationService, projectService),
  projectService: projectService,
  sshKeyService: new SshKeyService(aws, projectService, environmentService),
  authorizationService: dynamicAuthorizationService,
  routesIgnored: DynamicRouteConfig.routesIgnored
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
