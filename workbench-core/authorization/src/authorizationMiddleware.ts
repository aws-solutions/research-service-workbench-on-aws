import { LoggingService } from '@amzn/workbench-core-logging';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedUser } from './authenticatedUser';
import AuthorizationService from './authorizationService';
import { AuthenticatedUserNotFoundError } from './errors/authenticatedUserNotFoundError';
import { HTTPMethod, HTTPMethods } from './routesMap';
/**
 * change
 * Checks to ensure user object is an instance of {@link AuthenticatedUser}.
 * @param user - object that is suppose to represent the user.
 * @returns - boolean stating if user object is an instance of {@link AuthenticatedUser}.
 */
function instanceOfAuthenticatedUser(user: object): user is AuthenticatedUser {
  return user instanceof Object && user.hasOwnProperty('roles') && user.hasOwnProperty('id');
}

/**
 * Replaces path params in the path url to '*'
 * @param pathUrl - the path url.
 * @param pathParams - an object containing path params.
 * @returns
 */
function replacePathParams(pathUrl: string, pathParams: object): string {
  let modifiedUrl = pathUrl;
  Object.values(pathParams).forEach((pathParam) => {
    if (typeof pathParam === 'string') {
      modifiedUrl = modifiedUrl.replace(pathParam, '*');
    }
  });
  return modifiedUrl;
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
  return HTTPMethods.indexOf(method as HTTPMethod) !== -1;
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
      const route: string = req.params ? replacePathParams(req.path, req.params) : req.path;
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
