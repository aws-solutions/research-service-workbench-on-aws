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
  logoutUser,
  refreshAccessToken,
  verifyToken
} from '.';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  region: 'us-west-2',
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
  let service: AuthenticationService;
  let loggingService: LoggingService;
  let res: Response;

  beforeAll(() => {
    service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));
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
    let getTokensFromAuthorizationCodeMiddleware: (req: Request, res: Response) => Promise<void>;

    beforeEach(() => {
      getTokensFromAuthorizationCodeMiddleware = getTokensFromAuthorizationCode(service);
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

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', tokens.accessToken.token, {
        ...cookieOpts,
        expires: accessExpires
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', tokens.refreshToken.token, {
        ...cookieOpts,
        expires: refreshExpires
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ idToken: tokens.idToken.token });
    });

    it('should set the access and refresh tokens as session cookies when the AuthenticationService IDP sets them as such', async () => {
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      jest.spyOn(service, 'handleAuthorizationCode').mockResolvedValueOnce({
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

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', tokens.accessToken.token, {
        ...cookieOpts
      });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', tokens.refreshToken.token, {
        ...cookieOpts
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ idToken: tokens.idToken.token });
    });

    it('should return 400 when code param is missing', async () => {
      const req: Request = {
        body: {
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when code param is not a string', async () => {
      const req: Request = {
        body: {
          code: 123,
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeVerifier param is missing', async () => {
      const req: Request = {
        body: {
          code: 'validCode'
        }
      } as Request;

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeVerifier param is not a string', async () => {
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 123
        }
      } as Request;

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 401 when code param is invalid', async () => {
      const req: Request = {
        body: {
          code: 'invalidCode',
          codeVerifier: 'validCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 when codeVerifier param is invalid', async () => {
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'invalidCodeVerifier'
        }
      } as Request;

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      getTokensFromAuthorizationCodeMiddleware = getTokensFromAuthorizationCode(service, loggingService);
      const req: Request = {
        body: {
          code: 'validCode',
          codeVerifier: 'invalidCodeVerifier'
        }
      } as Request;
      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await getTokensFromAuthorizationCodeMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuthorizationCodeUrl tests', () => {
    let getAuthorizationCodeUrlMiddleware: (req: Request, res: Response) => Promise<void>;

    beforeAll(() => {
      getAuthorizationCodeUrlMiddleware = getAuthorizationCodeUrl(service);
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

      await getAuthorizationCodeUrlMiddleware(req, res);

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

      await getAuthorizationCodeUrlMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when stateVerifier param is not a string', async () => {
      const req: Request = {
        query: {
          stateVerifier: 123,
          codeChallenge: 'validCodeChallenge'
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeChallenge param is missing', async () => {
      const req: Request = {
        query: {
          stateVerifier: 'validState'
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 when codeChallenge param is not a string', async () => {
      const req: Request = {
        query: {
          stateVerifier: 'validState',
          codeChallenge: 123
        }
      } as unknown as Request;

      await getAuthorizationCodeUrlMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('verifyToken tests', () => {
    let verifyTokenMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;

    beforeAll(() => {
      verifyTokenMiddleware = verifyToken(service);
    });

    it('should continue to the next middleware when the access_token cookie is set and is valid', async () => {
      const req: Request = {
        cookies: {
          access_token: 'validToken'
        }
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.locals.user).toMatchObject({ id: 'id', roles: ['role'] });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 401 when access_token cookie is missing', async () => {
      const req: Request = {
        cookies: {}
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
        }
      } as Request;

      const next = jest.fn();

      await verifyTokenMiddleware(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      verifyTokenMiddleware = verifyToken(service, loggingService);
      const req: Request = {
        cookies: {
          access_token: 'invalidToken'
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
    let logoutUserMiddleware: (req: Request, res: Response) => Promise<void>;

    beforeAll(() => {
      logoutUserMiddleware = logoutUser(service);
    });

    it('should return 200, clear cookies, and revoke refresh token when refresh_token cookie is present and valid', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;

      await logoutUserMiddleware(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', { expires: new Date(0) });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', { expires: new Date(0) });
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should return 200 and clear cookies when refresh_token cookie is missing', async () => {
      const req: Request = {
        cookies: {}
      } as Request;

      await logoutUserMiddleware(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', { expires: new Date(0) });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', { expires: new Date(0) });
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should return 200 and clear cookies when refresh_token cookie is not a string', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 123
        }
      } as Request;

      await logoutUserMiddleware(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', { expires: new Date(0) });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', { expires: new Date(0) });
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should return 200 and clear cookies when refresh_token cookie is invalid', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      await logoutUserMiddleware(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', { expires: new Date(0) });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', { expires: new Date(0) });
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      logoutUserMiddleware = logoutUser(service, loggingService);
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await logoutUserMiddleware(req, res);

      expect(res.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'cleared', { expires: new Date(0) });
      expect(res.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'cleared', { expires: new Date(0) });
      expect(res.sendStatus).toHaveBeenCalledWith(200);
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshAccessToken tests', () => {
    let refreshAccessTokenMiddleware: (req: Request, res: Response) => Promise<void>;

    beforeAll(() => {
      refreshAccessTokenMiddleware = refreshAccessToken(service);
    });

    it('should return 200, the id token in the response body, and set the access token as a cookie when the refresh_token cookie is present and valid', async () => {
      const accessExpires = new Date(tokens.accessToken.expiresIn * 1000);

      const req: Request = {
        cookies: {
          refresh_token: 'validToken'
        }
      } as Request;

      await refreshAccessTokenMiddleware(req, res);

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

      jest.spyOn(service, 'refreshAccessToken').mockResolvedValueOnce({
        idToken: {
          token: 'id token'
        },
        accessToken: {
          token: 'access token'
        }
      });

      await refreshAccessTokenMiddleware(req, res);

      expect(res.cookie).toHaveBeenCalledWith('access_token', tokens.accessToken.token, { ...cookieOpts });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ idToken: tokens.idToken.token });
    });

    it('should return 401 when refresh_token cookie is missing', async () => {
      const req: Request = {
        cookies: {}
      } as Request;

      await refreshAccessTokenMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 when refresh_token cookie is not a string', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 123
        }
      } as Request;

      await refreshAccessTokenMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should return 401 when refresh_token cookie is invalid', async () => {
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      await refreshAccessTokenMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
    });

    it('should log to the LoggingService when it is provided and an AuthenticationService error occurs', async () => {
      refreshAccessTokenMiddleware = refreshAccessToken(service, loggingService);
      const req: Request = {
        cookies: {
          refresh_token: 'invalidToken'
        }
      } as Request;

      const loggingSpy = jest.spyOn(loggingService, 'error').mockImplementationOnce(() => {});

      await refreshAccessTokenMiddleware(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(loggingSpy).toHaveBeenCalledTimes(1);
    });
  });
});
