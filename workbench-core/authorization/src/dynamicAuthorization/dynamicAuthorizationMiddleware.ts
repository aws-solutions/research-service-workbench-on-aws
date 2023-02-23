/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from '@aws/workbench-core-logging';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUserParser } from '../models/authenticatedUser';
import { HTTPMethodParser } from '../models/routesMap';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';

/**
 * Creates an authorization middleware function for {@link https://expressjs.com/ | express} using the {@link AuthorizationService}.
 * @param authorizationService - {@link AuthorizationService}
 * @returns - The authorization middleware function.
 */
export default function withDynamicAuth(
  dynamicAuthorizationService: DynamicAuthorizationService,
  options?: {
    logger?: LoggingService;
  }
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  /**
   * Authorization Middleware
   */
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const route: string = req.baseUrl + req.path;
      const method = HTTPMethodParser.parse(req.method);
      const { data } = await dynamicAuthorizationService.isRouteIgnored({ route, method });
      if (data.routeIgnored) {
        next();
        return;
      }
      const authenticatedUser = AuthenticatedUserParser.parse(res.locals.user);
      console.log(
        `isAuthorizedOnRoute args: ${JSON.stringify({
          route,
          method,
          authenticatedUser
        })}`
      );
      await dynamicAuthorizationService.isAuthorizedOnRoute({
        route,
        method,
        authenticatedUser
      });
      next();
      return;
    } catch (err) {
      // log if a logger is provided)
      options?.logger?.error(`Dynamic Authorization Middleware Error: ${err}`);
      res.status(403).json({ error: 'User is not authorized' });
    }
  };
}
