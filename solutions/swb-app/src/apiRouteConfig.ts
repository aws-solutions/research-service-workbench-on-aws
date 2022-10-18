/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { HostingAccountService, ProjectService } from '@aws/workbench-core-accounts';
import { AwsService } from '@aws/workbench-core-base';
import { DataSetService, DataSetsStoragePlugin } from '@aws/workbench-core-datasets';
import {
  EnvironmentConnectionService,
  EnvironmentLifecycleService,
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService
} from '@aws/workbench-core-environments';

export interface ApiRouteConfig {
  awsService: AwsService;
  routes: ApiRoute[];
  environments: { [key: string]: Environment };
  account: HostingAccountService;
  environmentService: EnvironmentService;
  dataSetService: DataSetService;
  dataSetsStoragePlugin: DataSetsStoragePlugin;
  allowedOrigins: string[];
  environmentTypeService: EnvironmentTypeService;
  environmentTypeConfigService: EnvironmentTypeConfigService;
  projectService: ProjectService;
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
