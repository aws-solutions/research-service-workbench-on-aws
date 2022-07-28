/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser, RoutesIgnored } from '@amzn/workbench-core-authorization';
import { LoggingService } from '@amzn/workbench-core-logging';
import { Request, Response, NextFunction } from 'express';
import get from 'lodash/get';
import has from 'lodash/has';
import { AuthenticationService } from './authenticationService';
import { isIdpUnavailableError } from './errors/idpUnavailableError';

/**
 * An Express route handler function used to exchange the authorization code received from the authentication server for authentication tokens.
 * This route places the access token and refresh token, if it exists, into http only, secure, same site strict cookies and returns the id token
 * in the response body.
 *
 * This function assumes:
 *  - a request body parameter named `code` that holds the authorization code
 *  - a request body parameter named `codeVerifier` that holds a pkce code verifier value
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - an options object containing an optional logging service parameter
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('tokens', getTokensFromAuthorizationCode(authenticationService));
 * ```
 */
export function getTokensFromAuthorizationCode(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService } = options || {};
    const code = req.body.code;
    const codeVerifier = req.body.codeVerifier;

    if (typeof code === 'string' && typeof codeVerifier === 'string') {
      try {
        const { idToken, accessToken, refreshToken } = await authenticationService.handleAuthorizationCode(
          code,
          codeVerifier
        );

        const now = Date.now();

        // set cookies.
        // TODO: Delete code below adding access token to response and rely solely on cookies
        const data = {
          idToken: idToken.token,
          accessToken: accessToken.token
        };
        res.cookie('access_token', accessToken.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: accessToken.expiresIn ? new Date(now + accessToken.expiresIn * 1000) : undefined
        });
        if (refreshToken) {
          res.cookie('refresh_token', refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: refreshToken.expiresIn ? new Date(now + refreshToken.expiresIn * 1000) : undefined
          });
        }

        res.status(200).json(data);
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
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('codeUrl', getAuthorizationCodeUrl(authenticationService));
 * ```
 */
export function getAuthorizationCodeUrl(
  authenticationService: AuthenticationService
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const stateVerifier = req.query.stateVerifier;
    const codeChallenge = req.query.codeChallenge;
    if (typeof stateVerifier === 'string' && typeof codeChallenge === 'string') {
      res
        .status(200)
        .json({ redirectUrl: authenticationService.getAuthorizationCodeUrl(stateVerifier, codeChallenge) });
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
 * @param options - an options object containing optional routes to ignore and logging service parameters
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
      const accessToken = req.headers ? req.headers.authorization : undefined;
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
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - an options object containing an optional logging service parameter
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('logout', logoutUser(authenticationService));
 * ```
 */
export function logoutUser(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService } = options || {};
    const refreshToken = req.cookies.refresh_token;

    if (typeof refreshToken === 'string') {
      try {
        await authenticationService.revokeToken(refreshToken);
      } catch (error) {
        // token was not a refresh token or there was an authentication service configuration issue.
        if (loggingService) {
          loggingService.error(error);
        }
        if (isIdpUnavailableError(error)) {
          res.sendStatus(503);
        }
      }
    }

    res.cookie('access_token', 'cleared', { sameSite: 'lax', expires: new Date(0) });
    res.cookie('refresh_token', 'cleared', { sameSite: 'lax', expires: new Date(0) });

    res.status(200).json({ logoutUrl: authenticationService.getLogoutUrl() });
  };
}

/**
 * An Express route handler function used to refresh an expired access code.
 *
 * This function assumes:
 *  - the refresh token is stored in a cookie named `refresh_token`
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @param options - an options object containing an optional logging service parameter
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('refresh', refreshAccessToken(authenticationService));
 * ```
 */
export function refreshAccessToken(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService } = options || {};
    const refreshToken = req.cookies.refresh_token;

    if (typeof refreshToken === 'string') {
      try {
        const { idToken, accessToken } = await authenticationService.refreshAccessToken(refreshToken);

        // set access cookie
        res.cookie('access_token', accessToken.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: accessToken.expiresIn ? new Date(Date.now() + accessToken.expiresIn * 1000) : undefined
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
 * @param options - an options object containing an optional logging service parameter
 * @returns the route handler function
 *
 * @example
 * ```
 * app.get('loggedIn', isUserLoggedIn(authenticationService));
 * ```
 */
export function isUserLoggedIn(
  authenticationService: AuthenticationService,
  options?: { loggingService?: LoggingService }
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { loggingService } = options || {};
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    try {
      if (typeof refreshToken === 'string') {
        const { idToken, accessToken } = await authenticationService.refreshAccessToken(refreshToken);

        // set access cookie
        res.cookie('access_token', accessToken.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: accessToken.expiresIn ? new Date(Date.now() + accessToken.expiresIn * 1000) : undefined
        });

        res.status(200).json({ idToken: idToken.token, loggedIn: true });
      } else if (typeof accessToken === 'string') {
        const loggedIn = await authenticationService.isUserLoggedIn(accessToken);

        res.status(200).json({ loggedIn });
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
