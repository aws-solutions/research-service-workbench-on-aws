import cors from 'cors';
import express = require('express');
import { Router, Express, Request, Response } from 'express';
import { setUpAccountRoutes } from './accountRoutes';
import { ApiRoute, ApiRouteConfig } from './apiRouteConfig';
import { setUpEnvRoutes } from './environmentRoutes';
import { setUpEnvTypeConfigRoutes } from './environmentTypeConfigRoutes';
import { setUpEnvTypeRoutes } from './environmentTypeRoutes';
import { boomErrorHandler, unknownErrorHandler } from './errorHandlers';
import { setUpProjectRoutes } from './projectRoutes';

export function generateRouter(apiRouteConfig: ApiRouteConfig): Express {
  const app: Express = express();
  const router: Router = express.Router();

  app.use(cors({ origin: apiRouteConfig.allowedOrigins }));
  // parse application/json
  app.use(express.json());

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

  setUpEnvRoutes(router, apiRouteConfig.environments, apiRouteConfig.environmentService);
  setUpAccountRoutes(router, apiRouteConfig.account);
  setUpEnvTypeRoutes(router, apiRouteConfig.environmentTypeService);
  setUpEnvTypeConfigRoutes(router, apiRouteConfig.environmentTypeConfigService);
  setUpProjectRoutes(router, apiRouteConfig.projectService);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
