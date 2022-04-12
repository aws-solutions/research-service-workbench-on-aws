import express = require('express');
import { Router, Express, Request, Response } from 'express';
import { ApiRoute, ApiRouteConfig } from './apiRouteConfig';
import { setUpEnvRoutes } from './environmentRoutes';
import { setUpAccountRoutes } from './accountRoutes';

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
      const response = await apiRoute.service[apiRoute.serviceAction]();
      res.send(response);
    });
  });

  // TODO: Enable CORS so UI can make requests to backend

  setUpEnvRoutes(router, apiRouteConfig.environments);
  setUpAccountRoutes(router, apiRouteConfig.account);

  // TODO: Add error handling: https://github.com/awslabs/fhir-works-on-aws-routing/blob/7f0681545b4f2dc18151e696a0da1e5c601ebb33/src/router/routes/errorHandling.ts
  app.use('/', router);

  return app;
}
