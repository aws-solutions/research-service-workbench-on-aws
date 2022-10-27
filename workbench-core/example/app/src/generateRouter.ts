/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { csurf, verifyToken } from '@aws/workbench-core-authentication';
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
import express, { Router, Express } from 'express';
import { setUpAuthRoutes } from './routes/authRoutes';
import { setUpDSRoutes } from './routes/datasetRoutes';
import { boomErrorHandler, unknownErrorHandler } from './utilities/errorHandlers';
import * as StaticPermissionsConfig from './configs/staticPermissionsConfig';
import * as StaticRoutesConfig from './staticRouteConfig';
import { setUpUserRoutes } from './routes/userRoutes';
import {
  userManagementService,
  dataSetService,
  dataSetsStoragePlugin,
  authenticationService
} from './services';

export function generateRouter(): Express {
  const app: Express = express();
  app.disable('x-powered-by');
  const router: Router = express.Router();

  app.use(
    cors({
      origin: ['http://localhost:3000/'],
      credentials: true
    })
  );
  // parse application/json
  app.use(express.json());
  app.use(cookieParser());
  app.use(csurf('none'));

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

  setUpDSRoutes(router, dataSetService, dataSetsStoragePlugin);
  setUpAuthRoutes(router, authenticationService, logger);
  setUpUserRoutes(router, userManagementService);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
