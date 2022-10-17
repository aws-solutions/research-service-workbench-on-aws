/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  csurf,
  verifyToken,
  AuthenticationService,
  CognitoAuthenticationPluginOptions,
  CognitoAuthenticationPlugin,
  UserManagementService,
  CognitoUserManagementPlugin
} from '@aws/workbench-core-authentication';
import {
  withAuth,
  AuthorizationService,
  CASLAuthorizationPlugin,
  PermissionsMap,
  RoutesIgnored,
  RoutesMap,
  StaticPermissionsPlugin
} from '@aws/workbench-core-authorization';
import { LoggingService } from '@aws/workbench-core-logging';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router, Express, Request, Response } from 'express';
import { setUpAccountRoutes } from './accountRoutes';
import { ApiRoute, ApiRouteConfig } from './apiRouteConfig';
import { setUpAuthRoutes } from './authRoutes';
import { setUpDSRoutes } from './datasetRoutes';
import { setUpEnvRoutes } from './environmentRoutes';
import { setUpEnvTypeConfigRoutes } from './environmentTypeConfigRoutes';
import { setUpEnvTypeRoutes } from './environmentTypeRoutes';
import { boomErrorHandler, unknownErrorHandler } from './errorHandlers';
import { setUpProjectRoutes } from './projectRoutes';
import * as StaticPermissionsConfig from './staticPermissionsConfig';
import * as StaticRoutesConfig from './staticRouteConfig';
import { setUpUserRoutes } from './userRoutes';

export function generateRouter(apiRouteConfig: ApiRouteConfig): Express {
  const app: Express = express();
  app.disable('x-powered-by');
  const router: Router = express.Router();

  app.use(
    cors({
      origin: apiRouteConfig.allowedOrigins,
      credentials: true
    })
  );
  // parse application/json
  app.use(express.json());
  app.use(cookieParser());
  app.use(csurf('none'));

  const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
    cognitoDomain: process.env.COGNITO_DOMAIN!,
    userPoolId: process.env.USER_POOL_ID!,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!
  };

  const authenticationService = new AuthenticationService(
    new CognitoAuthenticationPlugin(cognitoPluginOptions)
  );

  // Create Authorization Service
  const staticPermissionsMap: PermissionsMap = StaticPermissionsConfig.permissionsMap;
  const staticRoutesMap: RoutesMap = StaticRoutesConfig.routesMap;
  const staticRoutesIgnored: RoutesIgnored = StaticRoutesConfig.routesIgnored;
  const logger: LoggingService = new LoggingService();
  const staticPermissionsPlugin: StaticPermissionsPlugin = new StaticPermissionsPlugin(
    staticPermissionsMap,
    staticRoutesMap,
    staticRoutesIgnored,
    logger
  );
  const caslAuthorizationsPlugin: CASLAuthorizationPlugin = new CASLAuthorizationPlugin();
  const authorizationService: AuthorizationService = new AuthorizationService(
    caslAuthorizationsPlugin,
    staticPermissionsPlugin
  );

  app.use(verifyToken(authenticationService, { ignoredRoutes: staticRoutesIgnored, loggingService: logger }));
  app.use(withAuth(authorizationService, { logger: logger }));

  // Dynamic routes
  apiRouteConfig.routes.forEach((apiRoute: ApiRoute) => {
    // Config setting is provided by developer, and not external user request
    // nosemgrep
    router[apiRoute.httpMethod](apiRoute.path, async (req: Request, res: Response) => {
      // Config setting is provided by developer, and not external user request
      // nosemgrep
      const response = await apiRoute.service[apiRoute.serviceAction]();
      res.send(response);
    });
  });

  const userManagementService: UserManagementService = new UserManagementService(
    new CognitoUserManagementPlugin(cognitoPluginOptions.userPoolId)
  );

  setUpEnvRoutes(router, apiRouteConfig.environments, apiRouteConfig.environmentService);
  setUpDSRoutes(
    router,
    apiRouteConfig.dataSetService,
    apiRouteConfig.dataSetsStoragePlugin,
    process.env.S3_DATASET_BUCKET_NAME!,
    process.env.MAIN_ACCOUNT_ID!,
    process.env.AWS_REGION!
  );
  setUpAccountRoutes(router, apiRouteConfig.account);
  setUpAuthRoutes(router, authenticationService, logger);
  setUpUserRoutes(router, userManagementService);
  setUpEnvTypeRoutes(router, apiRouteConfig.environmentTypeService);
  setUpEnvTypeConfigRoutes(router, apiRouteConfig.environmentTypeConfigService);
  setUpProjectRoutes(router, apiRouteConfig.projectService);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
