/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Express } from 'express';
import { generateRouter, ApiRouteConfig } from '@amzn/swb-app';
import { HostingAccountService, EnvironmentService } from '@amzn/environments';
import SagemakerEnvironmentLifecycleService from './environment/sagemaker/sagemakerEnvironmentLifecycleService';
import SagemakerEnvironmentConnectionService from './environment/sagemaker/sagemakerEnvironmentConnectionService';

const apiRouteConfig: ApiRouteConfig = {
  routes: [
    {
      path: '/foo',
      serviceAction: 'launch',
      httpMethod: 'post',
      service: new SagemakerEnvironmentLifecycleService()
    }
  ],
  environments: {
    sagemaker: {
      lifecycle: new SagemakerEnvironmentLifecycleService(),
      connection: new SagemakerEnvironmentConnectionService()
    }
  },
  account: new HostingAccountService(),
  environmentService: new EnvironmentService({
    TABLE_NAME: process.env.STACK_NAME!
  })
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
