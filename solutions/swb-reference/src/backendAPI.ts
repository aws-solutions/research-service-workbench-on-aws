/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Express } from 'express';
import { generateRouter, ApiRouteConfig } from '@amzn/swb-app';
import { HostingAccountService, EnvironmentService } from '@amzn/environments';
import SagemakerEnvironmentLifecycleService from './environment/sagemaker/sagemakerEnvironmentLifecycleService';
import SagemakerEnvironmentConnectionService from './environment/sagemaker/sagemakerEnvironmentConnectionService';
import HPCTest from './HPC/HPCTest';

const apiRouteConfig: ApiRouteConfig = {
  routes: [
    {
      path: '/HPC/:projectId/clusters',
      serviceAction: 'getPClusterList',
      httpMethod: 'get',
      service: new HPCTest()
    },
    {
      path: '/HPC/:projectId/clusters/:clusterName',
      serviceAction: 'getCluster',
      httpMethod: 'get',
      service: new HPCTest()
    },
    {
      path: '/HPC/:projectId/jobQueue/:instanceId',
      serviceAction: 'jobQueue',
      httpMethod: 'get',
      service: new HPCTest()
    },
    {
      path: '/HPC/:projectId/submitJob',
      serviceAction: 'submitJob',
      httpMethod: 'post',
      service: new HPCTest()
    },
    {
      path: '/HPC/:projectId/cancelJob/:instanceId/:jobId',
      serviceAction: 'cancelJob',
      httpMethod: 'put',
      service: new HPCTest()
    }
  ],
  environments: {
    sagemaker: {
      lifecycle: new SagemakerEnvironmentLifecycleService(),
      connection: new SagemakerEnvironmentConnectionService()
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
  })
};

const backendAPIApp: Express = generateRouter(apiRouteConfig);

export default backendAPIApp;
