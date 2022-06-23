import {
  verifyToken,
  AuthenticationService,
  CognitoAuthenticationPluginOptions,
  CognitoAuthenticationPlugin
} from '@amzn/workbench-core-authentication';
import {
  withAuth,
  AuthorizationService,
  CASLAuthorizationPlugin,
  PermissionsMap,
  RoutesIgnored,
  RoutesMap,
  StaticPermissionsPlugin
} from '@amzn/workbench-core-authorization';
import { LoggingService } from '@amzn/workbench-core-logging';
import cookieParser from 'cookie-parser';
import express = require('express');
import { Router, Express, Request, Response } from 'express';
import { setUpAccountRoutes } from './accountRoutes';
import { ApiRoute, ApiRouteConfig } from './apiRouteConfig';
import { setUpAuthRoutes } from './authRoutes';
import { setUpEnvRoutes } from './environmentRoutes';
import { setUpEnvTypeConfigRoutes } from './environmentTypeConfigRoutes';
import { setUpEnvTypeRoutes } from './environmentTypeRoutes';
import { boomErrorHandler, unknownErrorHandler } from './errorHandlers';
import * as StaticPermissionsConfig from './staticPermissionsConfig';
import * as StaticRoutesConfig from './staticRouteConfig';
import { setUpUserRoutes } from './userRoutes';

export function generateRouter(apiRouteConfig: ApiRouteConfig): Express {
  const app: Express = express();
  const router: Router = express.Router();

  // parse application/json
  app.use(express.json());
  app.use(cookieParser());

  const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
    region: process.env.AWS_REGION!,
    cognitoDomain: process.env.COGNITO_DOMAIN!,
    userPoolId: process.env.USER_POOL_ID!,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    websiteUrl: process.env.WEBSITE_URL!
  };

  const authenticationService = new AuthenticationService(
    new CognitoAuthenticationPlugin(cognitoPluginOptions)
  );
  const logger: LoggingService = new LoggingService();

  // Create Authorization Service
  const staticPermissionsMap: PermissionsMap = StaticPermissionsConfig.permissionsMap;
  const staticRoutesMap: RoutesMap = StaticRoutesConfig.routesMap;
  const staticRoutesIgnored: RoutesIgnored = StaticRoutesConfig.routesIgnored;
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
  app.use(withAuth(authorizationService));

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

  // TODO: Enable CORS so UI can make requests to backend

  setUpEnvRoutes(router, apiRouteConfig.environments, apiRouteConfig.environmentService);
  setUpAccountRoutes(router, apiRouteConfig.account);
  setUpAuthRoutes(router, apiRouteConfig.auth, logger);
  setUpUserRoutes(router, apiRouteConfig.user);
  setUpEnvTypeRoutes(router, apiRouteConfig.environmentTypeService);
  setUpEnvTypeConfigRoutes(router, apiRouteConfig.environmentTypeConfigService);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
