import {
  HostingAccountService,
  EnvironmentConnectionService,
  EnvironmentLifecycleService,
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService,
  ProjectService
} from '@amzn/environments';
import { DataSetService, DataSetsStoragePlugin } from '@amzn/workbench-core-datasets';

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
