/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { HostingAccountService, EnvironmentService } from '@amzn/environments';
import { generateRouter, ApiRouteConfig } from '@amzn/swb-app';
import { Express } from 'express';
import SagemakerEnvironmentConnectionService from './environment/sagemaker/sagemakerEnvironmentConnectionService';
import SagemakerEnvironmentLifecycleService from './environment/sagemaker/sagemakerEnvironmentLifecycleService';
import HPC from './HPC/HPC';

const apiRouteConfig: ApiRouteConfig = {
  routes: [
    {
      path: '/projects/:projectId/clusters',
      serviceAction: 'getAwsCluster',
      httpMethod: 'get',
      service: new HPC()
    },
    {
      path: '/projects/:projectId/clusters/:clusterName',
      serviceAction: 'getAwsCluster',
      httpMethod: 'get',
      service: new HPC()
    },
    {
      path: '/projects/:projectId/clusters/:clusterName/headNode/:instanceId/jobs',
      serviceAction: 'jobQueue',
      httpMethod: 'get',
      service: new HPC()
    },
    {
      path: '/projects/:projectId/clusters/:clusterName/headNode/:instanceId/jobs',
      serviceAction: 'submitJob',
      httpMethod: 'post',
      service: new HPC()
    },
    {
      path: '/projects/:projectId/clusters/:clusterName/headNode/:instanceId/jobs/:jobId/cancel',
      serviceAction: 'cancelJob',
      httpMethod: 'put',
      service: new HPC()
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
