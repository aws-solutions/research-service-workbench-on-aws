import express = require('express');
import { Router, Express, Request, Response } from 'express';
import { ApiRoute, ApiRouteConfig } from './apiRouteConfig';
import { setUpEnvRoutes } from './environmentRoutes';
import { setUpAccountRoutes } from './accountRoutes';
import { boomErrorHandler, unknownErrorHandler } from './errorHandlers';

export function generateRouter(apiRouteConfig: ApiRouteConfig): Express {
  const app: Express = express();
  const router: Router = express.Router();

  // parse application/json
  app.use(express.json());

  // Dynamic routes
  apiRouteConfig.routes.forEach((apiRoute: ApiRoute) => {
    // Config setting is provided by developer, and not external user request
    // nosemgrep
    router[apiRoute.httpMethod](apiRoute.path, async (req: Request, res: Response) => {
      // Config setting is provided by developer, and not external user request
      // nosemgrep
      const response = await apiRoute.service[apiRoute.serviceAction](req);
      res.send(response);
    });
  });

  // TODO: Enable CORS so UI can make requests to backend

  setUpEnvRoutes(router, apiRouteConfig.environments, apiRouteConfig.environmentService);
  setUpAccountRoutes(router, apiRouteConfig.account);

  // Error handling. Order of the error handlers is important
  router.use(boomErrorHandler);
  router.use(unknownErrorHandler);

  app.use('/', router);

  return app;
}
