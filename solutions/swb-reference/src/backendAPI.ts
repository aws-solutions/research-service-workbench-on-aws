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
import {
  AuthenticationService,
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions,
  UserManagementService,
  CognitoUserManagementPlugin
} from '@amzn/workbench-core-authentication';
import { Express } from 'express';
import SagemakerEnvironmentConnectionService from './environment/sagemaker/sagemakerEnvironmentConnectionService';
import SagemakerEnvironmentLifecycleService from './environment/sagemaker/sagemakerEnvironmentLifecycleService';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  region: process.env.AWS_REGION!,
  cognitoDomain: process.env.COGNITO_DOMAIN!,
  userPoolId: process.env.USER_POOL_ID!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  websiteUrl: process.env.WEBSITE_URL!
};

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

    // Add your environment types here as follows:
    // <newEnvTypeName>: {
    //   lifecycle: new <newEnvTypeName>EnvironmentLifecycleService(),
    //   connection: new <newEnvTypeName>EnvironmentConnectionService()
    // }
  },
  account: new HostingAccountService(),
  auth: new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions)),
  user: new UserManagementService(new CognitoUserManagementPlugin(cognitoPluginOptions.userPoolId)),
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
