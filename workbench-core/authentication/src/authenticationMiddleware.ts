/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser, RoutesIgnored } from '@aws/workbench-core-authorization';
import { LoggingService } from '@aws/workbench-core-logging';
import csrf from 'csurf';
import { Request, Response, NextFunction, CookieOptions } from 'express';
import get from 'lodash/get';
import has from 'lodash/has';
import { AuthenticationService } from './authenticationService';
import { isIdpUnavailableError } from './errors/idpUnavailableError';

const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
};

/**
 * An Express middleware function used to add csrf protection to an Express app.
 * Uses Express's [csurf](http://expressjs.com/en/resources/middleware/csurf.html) library with the cookie implementation.
 *
 * This function assumes:
 *  - the middleware is mounted using `app.use()`
 *  - the csrf token returned by the `getAuthorizationCodeUrl` or `isUserLoggedIn` route handler is included in all requests in one of the following colations:
 *    - req.body._csrf
 *    - req.query._csrf
 *    - req.headers['csrf-token']
 *    - req.headers['xsrf-token']
 *    - req.headers['x-csrf-token']
 *    - req.headers['x-xsrf-token']

 *
 * @param sameSite - (optional) the csrf cookie's `sameSite` value. Defaults to `'strict'` if not included
 * @returns the middleware function
 *
 * @example
 * ```
 * app.use(csurf());
 * ```
 */
export function csurf(
  sameSite?: 'none' | 'lax' | 'strict'
): (req: Request, res: Response, next: NextFunction) => void {
  return csrf({
    cookie: {
      ...defaultCookieOptions,
      sameSite: sameSite ?? defaultCookieOptions.sameSite
    }
  });
}

export const getRequestOrigin = (req: Pick<Request, 'headers'>): string | undefined => {
  const { origin, referer } = req.headers;
  // HTTP header Origin is optional and may not be included (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin)
  return origin ?? (referer ? new URL(referer.toString()).origin : undefined);
};

/**
 * An Express route handler function used to exchange the authorization code received from the authentication server for authentication tokens.
 * This route places the access token and refresh token, if it exists, into http only, secure, same site strict cookies and returns the id token
 * in the response body.
 *
 * This function assumes:
 *  - a request body parameter named `code` that holds the authorization code
 *  - a request body parameter named `codeVerifier` that holds a pkce code verifier value
 *  - the request origin header exists
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - object containing optional sameSite cookie and logging service parameters
 * @returns the route handler function
 *
 * @example
 * ```
 * app.post('token', getTokensFromAuthorizationCode(authenticationService));
 * ```
 */
export function getTokensFromAuthorizationCode(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService; sameSite?: 'none' | 'lax' | 'strict' }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService, sameSite } = options || {};
    const code = req.body.code;
    const codeVerifier = req.body.codeVerifier;
    const websiteUrl = getRequestOrigin(req);

    if (typeof code === 'string' && typeof codeVerifier === 'string' && typeof websiteUrl === 'string') {
      try {
        const { idToken, accessToken, refreshToken } = await authenticationService.handleAuthorizationCode(
          code,
          codeVerifier,
          websiteUrl
        );

        // set cookies
        res.cookie('access_token', accessToken.token, {
          ...defaultCookieOptions,
          sameSite: sameSite ?? defaultCookieOptions.sameSite,
          maxAge: accessToken.expiresIn
        });
        if (refreshToken) {
          res.cookie('refresh_token', refreshToken.token, {
            ...defaultCookieOptions,
            sameSite: sameSite ?? defaultCookieOptions.sameSite,
            maxAge: refreshToken.expiresIn
          });
        }

        res.status(200).json({ idToken: idToken.token });
      } catch (error) {
        if (loggingService) {
          loggingService.error(error);
        }
        if (isIdpUnavailableError(error)) {
          res.sendStatus(503);
        } else {
          res.sendStatus(401);
        }
      }
    } else {
      res.sendStatus(400);
    }
  };
}

/**
 * An Express route handler function used to get the url to the authentication hosted UI.
 * The `stateVerifier` and `codeChallenge` request query parameters are temporary values passed in by the client. The client will replace these values later
 * in order to keep them a client secret.
 *
 * This function assumes:
 *  - a request query parameter named `stateVerifier` that holds a temporary state value
 *  - a request query parameter named `codeChallenge` that holds a temporary pkce code challenge value
 *  - the request origin header exists
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - object containing optional csrf parameter
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('login', getAuthorizationCodeUrl(authenticationService));
 * ```
 */
export function getAuthorizationCodeUrl(
  authenticationService: AuthenticationService,
  options?: { csrf?: boolean }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { csrf } = options || {};
    const stateVerifier = req.query.stateVerifier;
    const codeChallenge = req.query.codeChallenge;
    const websiteUrl = getRequestOrigin(req);
    const includeCsrfToken = csrf ?? true;

    if (
      typeof stateVerifier === 'string' &&
      typeof codeChallenge === 'string' &&
      typeof websiteUrl === 'string'
    ) {
      const data = {
        signInUrl: authenticationService.getAuthorizationCodeUrl(stateVerifier, codeChallenge, websiteUrl),
        csrfToken: includeCsrfToken ? req.csrfToken() : undefined
      };

      res.status(200).json(data);
    } else {
      res.sendStatus(400);
    }
  };
}

/**
 * An Express middleware function used to authenticate a user from its access token.
 * If authenticated, the user's id and roles will be stored in `res.locals.user`
 *
 * This function assumes:
 *  - the middleware is mounted using `app.use()`
 *  - the access token is stored in a cookie named `access_token`
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - object containing optional routes to ignore and logging service parameters
 * @returns the middleware function
 *
 * @example
 * ```
 * app.use(verifyToken(authenticationService));
 * ```
 */
export function verifyToken(
  authenticationService: AuthenticationService,
  options?: { ignoredRoutes?: RoutesIgnored; loggingService?: LoggingService }
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { ignoredRoutes, loggingService } = options || {};

    if (has(ignoredRoutes, req.path) && get(get(ignoredRoutes, req.path), req.method)) {
      next();
    } else {
      const accessToken = req.cookies.access_token;

      if (typeof accessToken === 'string') {
        try {
          const decodedAccessToken = await authenticationService.validateToken(accessToken);
          const user: AuthenticatedUser = {
            id: authenticationService.getUserIdFromToken(decodedAccessToken),
            roles: authenticationService.getUserRolesFromToken(decodedAccessToken)
          };
          res.locals.user = user;

          next();
        } catch (error) {
          if (loggingService) {
            loggingService.error(error);
          }
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(401);
      }
    }
  };
}

/**
 * An Express route handler function used to logout a user.
 *
 * This function assumes:
 *  - the access token is stored in a cookie named `access_token`
 *  - if there is a refresh token, it is stored in a cookie named `refresh_token`
 *  - the request origin header exists
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - object containing optional sameSite cookie and logging service parameters
 * @returns the route handler function
 *
 * @example
 * ```
 * app.post('logout', logoutUser(authenticationService));
 * ```
 */
export function logoutUser(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService; sameSite?: 'none' | 'lax' | 'strict' }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService, sameSite } = options || {};
    const refreshToken = req.cookies.refresh_token;
    const accessToken = req.cookies.access_token;
    const websiteUrl = getRequestOrigin(req);

    if (!websiteUrl) {
      res.sendStatus(400);
      return;
    }

    try {
      if (typeof refreshToken === 'string') {
        await authenticationService.revokeToken(refreshToken);
      }
      if (typeof accessToken === 'string') {
        await authenticationService.revokeAccessToken(accessToken);
      }
    } catch (error) {
      // token was not a refresh token or there was an authentication service configuration issue.
      if (loggingService) {
        loggingService.error(error);
      }
      if (isIdpUnavailableError(error)) {
        res.sendStatus(503);
        return;
      }
    }

    res.clearCookie('access_token', {
      ...defaultCookieOptions,
      sameSite: sameSite ?? defaultCookieOptions.sameSite
    });
    res.clearCookie('refresh_token', {
      ...defaultCookieOptions,
      sameSite: sameSite ?? defaultCookieOptions.sameSite
    });

    res.status(200).json({ logoutUrl: authenticationService.getLogoutUrl(websiteUrl) });
  };
}

/**
 * An Express route handler function used to refresh an expired access code.
 *
 * This function assumes:
 *  - the refresh token is stored in a cookie named `refresh_token`
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - object containing optional sameSite cookie and logging service parameters
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('refresh', refreshAccessToken(authenticationService));
 * ```
 */
export function refreshAccessToken(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService; sameSite?: 'none' | 'lax' | 'strict' }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService, sameSite } = options || {};
    const refreshToken = req.cookies.refresh_token;
    const oldAccessToken = req.cookies.access_token;

    if (typeof refreshToken === 'string') {
      try {
        const { idToken, accessToken } = await authenticationService.refreshAccessToken(refreshToken);
        // Revoke previous session
        if (typeof oldAccessToken === 'string') await authenticationService.revokeAccessToken(oldAccessToken);
        // set access cookie
        res.cookie('access_token', accessToken.token, {
          ...defaultCookieOptions,
          sameSite: sameSite ?? defaultCookieOptions.sameSite,
          maxAge: accessToken.expiresIn
        });

        res.status(200).json({ idToken: idToken.token });
      } catch (error) {
        // token could not be refreshed for some reason
        if (loggingService) {
          loggingService.error(error);
        }
        if (isIdpUnavailableError(error)) {
          res.sendStatus(503);
        } else {
          res.sendStatus(401);
        }
      }
    } else {
      // refresh token expired, must login again
      res.sendStatus(401);
    }
  };
}

/**
 * An Express route handler function used to check if there is a logged in user.
 * If there is valid refresh_token cookie present, the function will set a new access_token cookie
 * and return a new idToken as well as the logged in status in the response body.
 *
 * This function assumes:
 *  - the access token is stored in a cookie named `access_token`
 *  - if there is a refresh token, it is stored in a cookie named `refresh_token`
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - object containing optional sameSite cookie, csrf, and logging service parameters
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('loggedIn', isUserLoggedIn(authenticationService));
 * ```
 */
export function isUserLoggedIn(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService; sameSite?: 'none' | 'lax' | 'strict'; csrf?: boolean }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService, sameSite, csrf } = options || {};
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    const includeCsrfToken = csrf ?? true;

    try {
      if (typeof refreshToken === 'string') {
        const { idToken, accessToken } = await authenticationService.refreshAccessToken(refreshToken);

        // set access cookie
        res.cookie('access_token', accessToken.token, {
          ...defaultCookieOptions,
          sameSite: sameSite ?? defaultCookieOptions.sameSite,
          maxAge: accessToken.expiresIn
        });

        const data = {
          idToken: idToken.token,
          loggedIn: true,
          csrfToken: includeCsrfToken ? req.csrfToken() : undefined
        };

        res.status(200).json(data);
      } else if (typeof accessToken === 'string') {
        const loggedIn = await authenticationService.isUserLoggedIn(accessToken);

        const data = {
          loggedIn,
          csrfToken: includeCsrfToken && loggedIn ? req.csrfToken() : undefined
        };

        res.status(200).json(data);
      } else {
        res.status(200).json({ loggedIn: false });
      }
    } catch (error) {
      if (loggingService) {
        loggingService.error(error);
      }
      if (isIdpUnavailableError(error)) {
        res.sendStatus(503);
      } else {
        res.status(200).json({ loggedIn: false });
      }
    }
  };
}
