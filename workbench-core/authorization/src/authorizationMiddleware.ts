import { AuthenticatedUser } from '@amzn/workbench-core-authentication';
import { NextFunction, Request, Response } from 'express';
import AuthorizationService from './authorizationService';
import { HTTPMethod, HTTPMethods } from './routesMap';
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
 * @throws {@link Error}
 * Throws an error when authenticated user is not found.
 */
function retrieveUser(res: Response): AuthenticatedUser {
  if (instanceOfAuthenticatedUser(res.locals.user)) {
    return res.locals.user;
  }
  throw new Error('Authenticated user is not found');
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
 * Creates an authorization middleware function for Express using the {@link AuthorizationService}.
 * @param authorizationService - {@link AuthorizationService}
 * @returns - The authorization middleware function.
 */
export default function withAuth(
  authorizationService: AuthorizationService
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  /**
   * Authorization Middleware
   */
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: AuthenticatedUser = retrieveUser(res);
      const route: string = req.originalUrl;
      const method: string = req.method;
      if (checkMethod(method)) {
        await authorizationService.isAuthorizedOnRoute(user, route, method);
        next();
      } else throw new Error('Method not found');
    } catch (err) {
      res.status(403).json({ error: 'User is not authorized' });
    }
  };
}
