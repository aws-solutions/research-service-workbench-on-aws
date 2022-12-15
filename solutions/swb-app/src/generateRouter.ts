/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin, WithAudit, Writer } from '@aws/workbench-core-audit';
import {
  csurf,
  verifyToken,
  AuthenticationService,
  CognitoAuthenticationPluginOptions,
  CognitoAuthenticationPlugin
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
import express, { Router, Express, Request, Response, json } from 'express';
import { setUpAccountRoutes } from './accountRoutes';
import { ApiRoute, ApiRouteConfig } from './apiRouteConfig';
import CustomAuditLogger from './audit/customAuditLogger';
import CustomAuditPlugin from './audit/customAuditPlugin';
import CustomAuditExtractor from './audit/extractor';
import { setUpAuthRoutes } from './authRoutes';
import { setUpCostCenterRoutes } from './costCenterRoutes';
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
  const router: Router = Router();

  app.use(
    cors({
      origin: apiRouteConfig.allowedOrigins,
      credentials: true
    })
  );
  // parse application/json
  app.use(json());
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

  // Auditing
  const continueOnError = false;
  const requiredAuditValues = ['actor', 'source'];
  // Masking fields 'codeVerifier' and 'code' because they're in the body of '/token' API
  const fieldsToMask = ['user', 'password', 'accessKey', 'code', 'codeVerifier'];
  const writer: Writer = new CustomAuditLogger();
  const baseAuditPlugin: BaseAuditPlugin = new CustomAuditPlugin(writer);
  const auditService = new AuditService(baseAuditPlugin, continueOnError, requiredAuditValues, fieldsToMask);
  // Excluding these paths since requesters will not be authenticated yet. Therefore, we cannot log their userId in the audit logs
  // const excludePaths = ['/login', '/token', '/logout', '/refresh', '/loggedIn'];
  const excludePaths: string[] = [];
  app.use(WithAudit({ auditService, excludePaths, extractor: new CustomAuditExtractor() }));

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

  setUpCostCenterRoutes(router, apiRouteConfig.costCenterService, apiRouteConfig.projectService);
  setUpEnvRoutes(router, apiRouteConfig.environments, apiRouteConfig.environmentService);
  setUpDSRoutes(router, apiRouteConfig.dataSetService, apiRouteConfig.dataSetsStoragePlugin);
  setUpAccountRoutes(router, apiRouteConfig.account);
  setUpAuthRoutes(router, authenticationService, logger);
  setUpUserRoutes(router, apiRouteConfig.userManagementService);
  setUpEnvTypeRoutes(router, apiRouteConfig.environmentTypeService);
  setUpEnvTypeConfigRoutes(router, apiRouteConfig.environmentTypeConfigService);
  setUpProjectRoutes(router, apiRouteConfig.projectService);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
