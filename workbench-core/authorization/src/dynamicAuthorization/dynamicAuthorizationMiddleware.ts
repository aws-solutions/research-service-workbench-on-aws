/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from '@aws/workbench-core-logging';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
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
    rateLimiter?: {
      /**
       * Duration in seconds
       */
      duration: number;
      /**
       * Number of requests per duration
       */
      requests: number;
    };
  }
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  // Default allows 10 requests per 1 second from a single source
  const ratelimitOpts = {
    duration: options?.rateLimiter?.duration ?? 1,
    points: options?.rateLimiter?.requests ?? 10
  };
  // Utilize in memory rate limiter
  const rateLimiter = new RateLimiterMemory(ratelimitOpts);
  /**
   * Authorization Middleware
   */
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check for rate limiter
    try {
      await rateLimiter.consume(req.ip);
    } catch (rejRes) {
      res.status(429).json({ error: 'Too Many Requests' });
      return;
    }

    try {
      const route: string = req.baseUrl + req.path;
      const method = HTTPMethodParser.parse(req.method);
      const { data } = await dynamicAuthorizationService.isRouteIgnored({ route, method });
      if (data.routeIgnored) {
        next();
        return;
      }
      const authenticatedUser = AuthenticatedUserParser.parse(res.locals.user);
      await dynamicAuthorizationService.isAuthorizedOnRoute({
        route,
        method,
        authenticatedUser
      });
      next();
      return;
    } catch (err) {
      // log if a logger is provided
      options?.logger?.error(`Dynamic Authorization Middleware Error: ${err}`);
      res.status(403).json({ error: 'User is not authorized' });
    }
  };
}
