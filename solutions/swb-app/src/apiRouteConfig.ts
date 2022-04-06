import { EnvironmentConnectionService, EnvironmentLifecycleService } from '@amzn/environments';

export interface ApiRouteConfig {
  routes: ApiRoute[];
  environments: { [key: string]: Environment };
}

export interface ApiRoute {
  path: string;
  service: any;
  serviceAction: string;
  httpMethod: HTTPMethod;
}

export interface Environment {
  lifecycle: EnvironmentLifecycleService;
  connection: EnvironmentConnectionService;
}

export type HTTPMethod = 'post' | 'put' | 'delete' | 'get';
