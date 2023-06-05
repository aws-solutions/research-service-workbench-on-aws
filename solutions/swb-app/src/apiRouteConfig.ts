/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import CostCenterService from './accounts/services/costCenterService';
import HostingAccountService from './accounts/services/hostingAccountService';
import ProjectService from './accounts/services/projectService';
import { DynamicAuthorizationService } from './authorization/dynamicAuthorization/dynamicAuthorizationService';
import { RoutesIgnored } from './authorization/models/routesMap';
import { MetadataService } from './base/services/metadataService';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { EnvironmentPlugin } from './environments/environmentPlugin';
import EnvironmentConnectionService from './environments/models/environmentConnectionService';
import EnvironmentLifecycleService from './environments/models/environmentLifecycleService';
import { EnvironmentService } from './environments/services/environmentService';
import EnvironmentTypeService from './environments/services/environmentTypeService';
import { EnvTypeConfigPlugin } from './envTypeConfigs/envTypeConfigPlugin';
import { ProjectEnvPlugin } from './projectEnvs/projectEnvPlugin';
import { ProjectEnvTypeConfigPlugin } from './projectEnvTypeConfigs/projectEnvTypeConfigPlugin';
import { ProjectPlugin } from './projects/projectPlugin';
import { SshKeyPlugin } from './sshKeys/sshKeyPlugin';
import { UserManagementService } from './userManagement/userManagementService';

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
