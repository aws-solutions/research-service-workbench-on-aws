/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CostCenterService, HostingAccountService } from '@aws/workbench-core-accounts';
import { UserManagementService } from '@aws/workbench-core-authentication';
import { DataSetService, DataSetsStoragePlugin } from '@aws/workbench-core-datasets';
import {
  EnvironmentConnectionService,
  EnvironmentLifecycleService,
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService
} from '@aws/workbench-core-environments';

export interface ApiRouteConfig {
  routes: ApiRoute[];
  environments: { [key: string]: Environment };
  account: HostingAccountService;
  environmentService: EnvironmentService;
  dataSetService: DataSetService;
  dataSetsStoragePlugin: DataSetsStoragePlugin;
  allowedOrigins: string[];
  environmentTypeService: EnvironmentTypeService;
  environmentTypeConfigService: EnvironmentTypeConfigService;
  userManagementService: UserManagementService;
  costCenterService: CostCenterService;
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
