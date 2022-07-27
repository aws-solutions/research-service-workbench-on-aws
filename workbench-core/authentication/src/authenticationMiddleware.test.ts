/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('./authenticationService');
jest.mock('./plugins/cognitoAuthenticationPlugin');

import { LoggingService } from '@amzn/workbench-core-logging';
import { NextFunction, Request, Response } from 'express';
import { tokens } from './__mocks__/authenticationService';
import {
  AuthenticationService,
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions,
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
  IdpUnavailableError,
  isUserLoggedIn,
  logoutUser,
  refreshAccessToken,
  verifyToken
} from '.';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: 'fake-domain',
  userPoolId: 'us-west-2_fakeId',
  clientId: 'fake-client-id',
  clientSecret: 'fake-client-secret',
  websiteUrl: 'fake-website-url'
} as const;

const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
} as const;

describe('authenticationMiddleware integration tests', () => {
  let authenticationService: AuthenticationService;
  let loggingService: LoggingService;
  let res: Response;

  beforeEach(() => {
    authenticationService = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));
    loggingService = new LoggingService();

    jest.spyOn(Date, 'now').mockImplementation(() => 0);
  });

  beforeEach(() => {
    res = {
      cookie: jest.fn((name, val, opts) => res),
      status: jest.fn((code) => res),
      sendStatus: jest.fn((code) => res),
      json: jest.fn((body) => res),
      locals: {}
    } as unknown as Response;
  });

  describe('getTokensFromAuthorizationCode tests', () => {
    let getTokensFromAuthorizationCodeRouteHandler: (req: Request, res: Response) => Promise<void>;

    beforeEach(() => {
      getTokensFromAuthorizationCodeRouteHandler = getTokensFromAuthorizationCode(authenticationService);
    });

    it('should return 200, the id token in the response body, and set the access and refresh tokens as cookies when the code and codeVerifier params are valid', async () => {
      const accessExpires = new Date(tokens.accessToken.expiresIn * 1000);
      const refreshExpires = new Date(tokens.refreshToken.expiresIn * 1000);

      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', tokens.accessToken.token, {
        ...cookieOpts,
        expires: accessExpires
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', tokens.refreshToken.token, {
        ...cookieOpts,
        expires: refreshExpires
      });
      expect(res.status).toHaveBeenCalledWith(200);
      //TODO: Remove accessToken once cookies are properly set
      expect(res.json).toHaveBeenCalledWith({
        idToken: tokens.idToken.token,
        accessToken: tokens.accessToken.token
      });
    });

    it('should set the access and refresh tokens as session cookies when the AuthenticationService IDP sets them as such', async () => {
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      jest.spyOn(authenticationService, 'handleAuthorizationCode').mockResolvedValueOnce({
        idToken: {
          token: 'id token'
        },
        accessToken: {
          token: 'access token'
        },
        refreshToken: {
          token: 'refresh token'
        }
      });

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', tokens.accessToken.token, {
        ...cookieOpts
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', tokens.refreshToken.token, {
        ...cookieOpts
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        idToken: tokens.idToken.token,
        accessToken: tokens.accessToken.token
      });
    });

    it('should return 400 when code param is missing', async () => {
      const req: Request = {
        body: {
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when code param is not a string', async () => {
      const req: Request = {
        body: {
          code: 123,
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeVerifier param is missing', async () => {
      const req: Request = {
        body: {
          code: 'validCode'
        }
      } as Request;

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeVerifier param is not a string', async () => {
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 123
        }
      } as Request;

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 401 when code param is invalid', async () => {
      const req: Request = {
        body: {
          code: 'invalidCode',
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 when codeVerifier param is invalid', async () => {
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'invalidCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 503 when authN service IDP is unavailable', async () => {
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;
      jest
        .spyOn(authenticationService, 'handleAuthorizationCode')
        .mockRejectedValueOnce(new IdpUnavailableError());

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(503);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      getTokensFromAuthorizationCodeRouteHandler = getTokensFromAuthorizationCode(authenticationService, {
        loggingService
      });
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'invalidCodeVerifier'
        }
      } as Request;
      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await getTokensFromAuthorizationCodeRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuthorizationCodeUrl tests', () => {
    let getAuthorizationCodeUrlRouteHandler: (req: Request, res: Response) => Promise<void>;

    beforeEach(() => {
      getAuthorizationCodeUrlRouteHandler = getAuthorizationCodeUrl(authenticationService);
    });

    it('should return 200 and the authorization code url when the stateVerifier and codeChallenge params are valid', async () => {
      const stateVerifier = 'stateVerifier';
      const codeChallenge = 'codeChallenge';

      const req: Request = {
        query: {
          stateVerifier,
          codeChallenge
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        redirectUrl: `https://www.fakeurl.com/authorize?client_id=fake-id&response_type=code&scope=openid&redirect_uri=https://www.fakewebsite.com&state=${stateVerifier}&code_challenge_method=S256&code_challenge=${codeChallenge}`
      });
    });

    it('should return 400 when stateVerifier param is missing', async () => {
      const req: Request = {
        query: {
          codeChallenge: 'validCodeChallenge'
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when stateVerifier param is not a string', async () => {
      const req: Request = {
        query: {
          stateVerifier: 123,
          codeChallenge: 'validCodeChallenge'
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeChallenge param is missing', async () => {
      const req: Request = {
        query: {
          stateVerifier: 'validState'
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeChallenge param is not a string', async () => {
      const req: Request = {
        query: {
          stateVerifier: 'validState',
          codeChallenge: 123
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('verifyToken tests', () => {
    let verifyTokenMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;

    beforeEach(() => {
      verifyTokenMiddleware = verifyToken(authenticationService);
    });

    it('should continue to the next middleware when the access_token cookie is set and is valid', async () => {
      const req: Request = {
        cookies: {
          access_token: 'validToken'
        },
        headers: {
          authorization: 'validToken'
        }
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.locals.user).toMatchObject({ id: 'id', roles: ['role'] });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should continue to the next middleware when the route is included in the ignoredRoutes object', async () => {
      verifyTokenMiddleware = verifyToken(authenticationService, {
        ignoredRoutes: {
          '/ignored': {
            GET: true
          }
        }
      });
      const req: Request = {
        path: '/ignored',
        method: 'GET',
        cookies: {
          access_token: 'validToken'
        },
        headers: {
          authorization: 'validToken'
        }
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.locals.user).toBeUndefined();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should continue to the next middleware when the route is not in the ignoredRoutes object and the access_token cookie is set and is valid', async () => {
      verifyTokenMiddleware = verifyToken(authenticationService, {
        ignoredRoutes: {
          '/ignored': {
            GET: true,
            POST: false
          }
        }
      });
      const req: Request = {
        path: '/ignored',
        method: 'POST',
        cookies: {
          access_token: 'validToken'
        },
        headers: {
          authorization: 'validToken'
        }
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.locals.user).toMatchObject({ id: 'id', roles: ['role'] });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 401 when access_token cookie is missing', async () => {
      const req: Request = {
        cookies: {},
        headers: {}
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 401 when access_token cookie is not a string', async () => {
      const req: Request = {
        cookies: {
          access_token: 123
        }
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 401 when access_token cookie is invalid', async () => {
      const req: Request = {
        cookies: {
          access_token: 'invalidToken'
        },
        headers: {
          authorization: 'invalidToken'
        }
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      verifyTokenMiddleware = verifyToken(authenticationService, { loggingService });
      const req: Request = {
        cookies: {
          access_token: 'invalidToken'
        },
        headers: {
          authorization: 'invalidToken'
        }
      } as Request;

      const next = jest.fn();

      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await verifyTokenMiddleware(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledTimes(0);
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logoutUser tests', () => {
    let logoutUserRouteHandler: (req: Request, res: Response) => Promise<void>;

    beforeEach(() => {
      logoutUserRouteHandler = logoutUser(authenticationService);
    });

    it('should return 200, clear cookies, and revoke refresh token when refresh_token cookie is present and valid', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;

      await logoutUserRouteHandler(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        logoutUrl: 'https://www.fakeurl.com/logout?client_id=fake-id&logout_uri=https://www.fakewebsite.com'
      });
    });

    it('should return 200 and clear cookies when refresh_token cookie is missing', async () => {
      const req: Request = {
        cookies: {}
      } as Request;

      await logoutUserRouteHandler(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        logoutUrl: 'https://www.fakeurl.com/logout?client_id=fake-id&logout_uri=https://www.fakewebsite.com'
      });
    });

    it('should return 200 and clear cookies when refresh_token cookie is not a string', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 123
        }
      } as Request;

      await logoutUserRouteHandler(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        logoutUrl: 'https://www.fakeurl.com/logout?client_id=fake-id&logout_uri=https://www.fakewebsite.com'
      });
    });

    it('should return 200 and clear cookies when refresh_token cookie is invalid', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      await logoutUserRouteHandler(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        logoutUrl: 'https://www.fakeurl.com/logout?client_id=fake-id&logout_uri=https://www.fakewebsite.com'
      });
    });

    it('should return 503 when authN service IDP is unavailable', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;
      jest.spyOn(authenticationService, 'revokeToken').mockRejectedValueOnce(new IdpUnavailableError());

      await logoutUserRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(503);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      logoutUserRouteHandler = logoutUser(authenticationService, { loggingService });
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await logoutUserRouteHandler(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', {
        sameSite: 'lax',
        expires: new Date(0)
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        logoutUrl: 'https://www.fakeurl.com/logout?client_id=fake-id&logout_uri=https://www.fakewebsite.com'
      });
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshAccessToken tests', () => {
    let refreshAccessTokenRouteHandler: (req: Request, res: Response) => Promise<void>;

    beforeEach(() => {
      refreshAccessTokenRouteHandler = refreshAccessToken(authenticationService);
    });

    it('should return 200, the id token in the response body, and set the access token as a cookie when the refresh_token cookie is present and valid', async () => {
      const accessExpires = new Date(tokens.accessToken.expiresIn * 1000);

      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;

      await refreshAccessTokenRouteHandler(req, res);

      expect(res.cookie).toHaveBeenCalledWith('access_token', tokens.accessToken.token, {
        ...cookieOpts,
        expires: accessExpires
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ idToken: tokens.idToken.token });
    });

    it('should set the access token as a session cookie when AuthenticationService IDP defines them as such', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;

      jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValueOnce({
        idToken: {
          token: 'id token'
        },
        accessToken: {
          token: 'access token'
        }
      });

      await refreshAccessTokenRouteHandler(req, res);

      expect(res.cookie).toHaveBeenCalledWith('access_token', tokens.accessToken.token, { ...cookieOpts });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ idToken: tokens.idToken.token });
    });

    it('should return 401 when refresh_token cookie is missing', async () => {
      const req: Request = {
        cookies: {}
      } as Request;

      await refreshAccessTokenRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 when refresh_token cookie is not a string', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 123
        }
      } as Request;

      await refreshAccessTokenRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 when refresh_token cookie is invalid', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      await refreshAccessTokenRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 503 when authN service IDP is unavailable', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;
      jest
        .spyOn(authenticationService, 'refreshAccessToken')
        .mockRejectedValueOnce(new IdpUnavailableError());

      await refreshAccessTokenRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(503);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      refreshAccessTokenRouteHandler = refreshAccessToken(authenticationService, { loggingService });
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await refreshAccessTokenRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isUserLoggedIn tests', () => {
    let isUserLoggedInRouteHandler: (req: Request, res: Response) => Promise<void>;

    beforeEach(() => {
      isUserLoggedInRouteHandler = isUserLoggedIn(authenticationService);
    });

    it('should return 200 and set loggedIn to true in the response body when the access_token cookie is present and valid', async () => {
      const req: Request = {
        cookies: {
          access_token: 'validToken'
        },
        headers: {
          authorization: 'validToken'
        }
      } as Request;

      await isUserLoggedInRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ loggedIn: true });
    });

    it('should return 200 and set loggedIn to false in the response body when the access_token cookie is present and invalid', async () => {
      const req: Request = {
        cookies: {
          access_token: 'invalidToken'
        },
        headers: {
          authorization: 'invalidToken'
        }
      } as Request;

      await isUserLoggedInRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ loggedIn: false });
    });

    it('should return 200, set the access token as a cookie, set the id token in the response body, and set loggedIn to true in the response body when the access_token cookie is missing and the refresh_token cookie is present and valid', async () => {
      const accessExpires = new Date(tokens.accessToken.expiresIn * 1000);

      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;

      await isUserLoggedInRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ idToken: tokens.idToken.token, loggedIn: true });
      expect(res.cookie).toHaveBeenCalledWith('access_token', tokens.accessToken.token, {
        ...cookieOpts,
        expires: accessExpires
      });
    });

    it('should set the access token as a session cookie when AuthenticationService IDP defines them as such', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;

      jest.spyOn(authenticationService, 'refreshAccessToken').mockResolvedValueOnce({
        idToken: {
          token: 'id token'
        },
        accessToken: {
          token: 'access token'
        }
      });

      await isUserLoggedInRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ idToken: tokens.idToken.token, loggedIn: true });
      expect(res.cookie).toHaveBeenCalledWith('access_token', tokens.accessToken.token, { ...cookieOpts });
    });

    it('should return 200 and set loggedIn to false in the response body when the access_token and refresh_token cookies are missing', async () => {
      const req: Request = {
        cookies: {}
      } as Request;

      await isUserLoggedInRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ loggedIn: false });
    });

    it('should return 200 and set loggedIn to false in the response body when refresh_token cookie is invalid', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      await isUserLoggedInRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ loggedIn: false });
    });

    it('should return 503 when authN service isUserLoggedIn throws service unavailable', async () => {
      const req: Request = {
        cookies: {
          access_token: 'validToken'
        },
        headers: {
          authorization: 'validToken'
        }
      } as Request;
      jest.spyOn(authenticationService, 'isUserLoggedIn').mockRejectedValueOnce(new IdpUnavailableError());

      await isUserLoggedInRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(503);
    });

    it('should return 503 when authN service refreshAccessToken throws service unavailable', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;
      jest
        .spyOn(authenticationService, 'refreshAccessToken')
        .mockRejectedValueOnce(new IdpUnavailableError());

      await isUserLoggedInRouteHandler(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(503);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      isUserLoggedInRouteHandler = isUserLoggedIn(authenticationService, { loggingService });
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await isUserLoggedInRouteHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ loggedIn: false });
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });
});
