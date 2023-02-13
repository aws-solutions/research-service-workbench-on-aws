/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CostCenterService, HostingAccountService, ProjectService } from '@aws/workbench-core-accounts';
import { DynamicAuthorizationService } from '@aws/workbench-core-authorization';
import { MetadataService } from '@aws/workbench-core-base';
import {
  EnvironmentConnectionService,
  EnvironmentLifecycleService,
  EnvironmentService,
  EnvironmentTypeService
} from '@aws/workbench-core-environments';
import { UserManagementService } from '@aws/workbench-core-user-management';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { EnvTypeConfigPlugin } from './envTypeConfigs/envTypeConfigPlugin';
import { ProjectEnvPlugin } from './projectEnvs/projectEnvPlugin';
import { ProjectEnvTypeConfigPlugin } from './projectEnvTypeConfigs/projectEnvTypeConfigPlugin';
import { SshKeyPlugin } from './sshKeys/sshKeyPlugin';

export interface ApiRouteConfig {
  environments: { [key: string]: EnvironmentUtilityServices };
  account: HostingAccountService;
  environmentService: EnvironmentService;
  dataSetService: DataSetPlugin;
  allowedOrigins: string[];
  environmentTypeService: EnvironmentTypeService;
  environmentTypeConfigService: EnvTypeConfigPlugin;
  projectService: ProjectService;
  userManagementService: UserManagementService;
  costCenterService: CostCenterService;
  metadataService: MetadataService;
  projectEnvPlugin: ProjectEnvPlugin;
  projectEnvTypeConfigPlugin: ProjectEnvTypeConfigPlugin;
  sshKeyService: SshKeyPlugin;
  authorizationService: DynamicAuthorizationService;
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
