/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { LoggingService } from '@aws/workbench-core-logging';
import { NextFunction, Request, Response } from 'express';
import AuthorizationService from './authorizationService';
import { AuthenticatedUserNotFoundError } from './errors/authenticatedUserNotFoundError';
import { AuthenticatedUser } from './models/authenticatedUser';
import { HTTPMethod, HTTPMethodParser } from './models/routesMap';
/**
 * Checks to ensure user object is an instance of {@link AuthenticatedUser}.
 * @param user - object that is suppose to represent the user.
 * @returns - boolean stating if user object is an instance of {@link AuthenticatedUser}.
 */
function instanceOfAuthenticatedUser(user: object): user is AuthenticatedUser {
  return user instanceof Object && user.hasOwnProperty('roles') && user.hasOwnProperty('id');
}

/**
 * Retrieves the user from the {@link Response}.
 * @param res - {@link Response}
 * @returns - {@link AuthenticatedUser}
 *
 * @throws {@link AuthenticatedUserNotFoundError}
 * Throws an error when authenticated user is not found.
 */
export function retrieveUser(res: Response): AuthenticatedUser {
  if (instanceOfAuthenticatedUser(res.locals.user)) {
    return res.locals.user;
  }
  throw new AuthenticatedUserNotFoundError('Authenticated user is not found');
}
/**
 * Checks whether the string method is a valid {@link HTTPMethod}
 * @param method - The method being checked
 * @returns - boolean stating if method is a valid {@link HTTPMethod}
 */
function checkMethod(method: string): method is HTTPMethod {
  return HTTPMethodParser.safeParse(method).success;
}

/**
 * Creates an authorization middleware function for {@link https://expressjs.com/ | express} using the {@link AuthorizationService}.
 * @param authorizationService - {@link AuthorizationService}
 * @returns - The authorization middleware function.
 */
export default function withAuth(
  authorizationService: AuthorizationService,
  options?: {
    logger?: LoggingService;
  }
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  /**
   * Authorization Middleware
   */
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const route: string = req.path;
      const method: string = req.method;
      if (checkMethod(method)) {
        if (await authorizationService.isRouteIgnored(route, method)) {
          next();
        } else {
          const user: AuthenticatedUser = retrieveUser(res);
          await authorizationService.isAuthorizedOnRoute(user, route, method);
          next();
        }
      } else throw new Error('Method is not valid');
    } catch (err) {
      // log if a logger is provided
      options?.logger?.error(err);
      res.status(403).json({ error: 'User is not authorized' });
    }
  };
}
