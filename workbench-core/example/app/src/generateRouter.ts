/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { csurf, verifyToken } from '@aws/workbench-core-authentication';
import { withAuth } from '@aws/workbench-core-authorization';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router, Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import { setUpAuthRoutes } from './routes/authRoutes';
import { setUpDSRoutes } from './routes/datasetRoutes';
import { setupHelloWorldRoutes } from './routes/helloWorldRoutes';
import { setUpUserRoutes } from './routes/userRoutes';
import {
  userManagementService,
  dataSetService,
  dataSetsStoragePlugin,
  authenticationService,
  logger
} from './services';
import { authorizationService, staticRoutesIgnored } from './services/authorizationService';
import { boomErrorHandler, unknownErrorHandler } from './utilities/errorHandlers';

export function generateRouter(): Express {
  const app: Express = express();
  app.disable('x-powered-by');
  const router: Router = express.Router();

  //Adding rate limiting
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 6000, // Limit each IP to 6000 requests per `window` (here, per 1 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
  });

  app.use(limiter);

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

  app.use(verifyToken(authenticationService, { ignoredRoutes: staticRoutesIgnored, loggingService: logger }));
  app.use(withAuth(authorizationService, { logger: logger }));

  setupHelloWorldRoutes(router);
  setUpDSRoutes(router, dataSetService, dataSetsStoragePlugin);
  setUpAuthRoutes(router, authenticationService, logger);
  setUpUserRoutes(router, userManagementService);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
