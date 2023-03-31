/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CostCenterService, HostingAccountService, ProjectService } from '@aws/workbench-core-accounts';
import { DynamicAuthorizationService, RoutesIgnored } from '@aws/workbench-core-authorization';
import { MetadataService } from '@aws/workbench-core-base';
import {
  EnvironmentConnectionService,
  EnvironmentLifecycleService,
  EnvironmentService,
  EnvironmentTypeService
} from '@aws/workbench-core-environments';
import { UserManagementService } from '@aws/workbench-core-user-management';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { EnvironmentPlugin } from './environments/environmentPlugin';
import { EnvTypeConfigPlugin } from './envTypeConfigs/envTypeConfigPlugin';
import { ProjectEnvPlugin } from './projectEnvs/projectEnvPlugin';
import { ProjectEnvTypeConfigPlugin } from './projectEnvTypeConfigs/projectEnvTypeConfigPlugin';
import { ProjectPlugin } from './projects/projectPlugin';
import { SshKeyPlugin } from './sshKeys/sshKeyPlugin';

export interface ApiRouteConfig {
  environments: { [key: string]: EnvironmentUtilityServices };
  account: HostingAccountService;
  environmentService: EnvironmentService;
  environmentPlugin: EnvironmentPlugin;
  dataSetService: DataSetPlugin;
  allowedOrigins: string[];
  environmentTypeService: EnvironmentTypeService;
  environmentTypeConfigService: EnvTypeConfigPlugin;
  userManagementService: UserManagementService;
  costCenterService: CostCenterService;
  metadataService: MetadataService;
  projectEnvPlugin: ProjectEnvPlugin;
  projectEnvTypeConfigPlugin: ProjectEnvTypeConfigPlugin;
  projectPlugin: ProjectPlugin;
  projectService: ProjectService;
  sshKeyService: SshKeyPlugin;
  authorizationService: DynamicAuthorizationService;
  routesIgnored: RoutesIgnored;
}

export interface ApiRoute {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: any;
  serviceAction: string;
  httpMethod: HTTPMethod;
}

export interface EnvironmentUtilityServices {
  lifecycle: EnvironmentLifecycleService;
  connection: EnvironmentConnectionService;
}

export type HTTPMethod = 'post' | 'put' | 'delete' | 'get';
