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
  EnvironmentTypeService,
  EnvironmentTypeConfigService
} from '@aws/workbench-core-environments';
import { UserManagementService } from '@aws/workbench-core-user-management';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { KeyPairPlugin } from './keyPairs/keyPairPlugin';
import { ProjectEnvTypeConfigPlugin } from './projectEnvTypeConfigs/projectEnvTypeConfigPlugin';

export interface ApiRouteConfig {
  routes: ApiRoute[];
  environments: { [key: string]: Environment };
  account: HostingAccountService;
  environmentService: EnvironmentService;
  dataSetService: DataSetPlugin;
  allowedOrigins: string[];
  environmentTypeService: EnvironmentTypeService;
  environmentTypeConfigService: EnvironmentTypeConfigService;
  projectService: ProjectService;
  userManagementService: UserManagementService;
  costCenterService: CostCenterService;
  metadataService: MetadataService;
  projectEnvTypeConfigPlugin: ProjectEnvTypeConfigPlugin;
  keyPairService: KeyPairPlugin;
  authorizationService: DynamicAuthorizationService;
}

export interface ApiRoute {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: any;
  serviceAction: string;
  httpMethod: HTTPMethod;
}

export interface Environment {
  lifecycle: EnvironmentLifecycleService;
  connection: EnvironmentConnectionService;
}

export type HTTPMethod = 'post' | 'put' | 'delete' | 'get';
