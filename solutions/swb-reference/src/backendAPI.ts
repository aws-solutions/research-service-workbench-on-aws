/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  HostingAccountService,
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService
} from '@amzn/environments';
import { generateRouter, ApiRouteConfig } from '@amzn/swb-app';
import { Express } from 'express';
import SagemakerExampleEnvironmentConnectionService from './environment/sagemakerExample/sagemakerExampleEnvironmentConnectionService';
import SagemakerExampleEnvironmentLifecycleService from './environment/sagemakerExample/sagemakerExampleEnvironmentLifecycleService';
import SagemakerNotebookEnvironmentConnectionService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentConnectionService';
import SagemakerNotebookEnvironmentLifecycleService from './environment/sagemakerNotebook/sagemakerNotebookEnvironmentLifecycleService';

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
    },
    sagemakerExample: {
      lifecycle: new SagemakerExampleEnvironmentLifecycleService(),
      connection: new SagemakerExampleEnvironmentConnectionService()
    }

    // Add your environment types here as follows:
    // <newEnvTypeName>: {
    //   lifecycle: new <newEnvTypeName>EnvironmentLifecycleService(),
    //   connection: new <newEnvTypeName>EnvironmentConnectionService()
    // }
  },
  account: new HostingAccountService(),
  environmentService: new EnvironmentService({
    TABLE_NAME: process.env.STACK_NAME!
  }),
  allowedOrigins: JSON.parse(process.env.ALLOWED_ORIGINS || '[]'),
  environmentTypeService: new EnvironmentTypeService({
    TABLE_NAME: process.env.STACK_NAME!
  }),
  environmentTypeConfigService: new EnvironmentTypeConfigService({
    TABLE_NAME: process.env.STACK_NAME!
  })
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
