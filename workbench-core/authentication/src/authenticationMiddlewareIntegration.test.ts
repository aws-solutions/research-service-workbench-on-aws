jest.mock('./authenticationService');
jest.mock('./plugins/cognitoAuthenticationPlugin');

import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import request from 'supertest';
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
};

const tokens = {
  idToken: {
    token: 'id token',
    expiresIn: 1234
  },
  accessToken: {
    token: 'access token',
    expiresIn: 1234
  },
  refreshToken: {
    token: 'refresh token',
    expiresIn: 1234
  }
};

describe('authenticationMiddleware integration tests', () => {
  let service: AuthenticationService;
  let app: Express;

  beforeAll(() => {
    service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    app = express();
    app.use(cookieParser());
    app.use(express.json());

    app.post('/token', getTokensFromAuthorizationCode(service));
    app.get('/login', getAuthorizationCodeUrl(service));
    app.get('/pro', verifyToken(service), (req, res) => {
      res.status(200).json({ user: res.locals.user });
    });
    app.get('/logout', logoutUser(service));
    app.get('/refresh', refreshAccessToken(service));
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getTokensFromAuthorizationCode tests', () => {
    it('should return 200, the id token in the response body, and set the access and refresh tokens as cookies when the code and codeVerifier params are valid', async () => {
      const accessExpires = new Date(tokens.accessToken.expiresIn * 1000).toUTCString();
      const refreshExpires = new Date(tokens.refreshToken.expiresIn * 1000).toUTCString();
      jest.spyOn(service, 'handleAuthorizationCode').mockResolvedValue(tokens);
      jest.spyOn(Date, 'now').mockImplementation(() => 0);

      await request(app)
        .post('/token')
        .send({ code: 'valid code', codeVerifier: 'valid code verifier' })
        .expect('Content-Type', /json/)
        .expect(
          'set-cookie',
          `access_token=access%20token; Path=/; Expires=${accessExpires}; HttpOnly; Secure; SameSite=Strict,refresh_token=refresh%20token; Path=/; Expires=${refreshExpires}; HttpOnly; Secure; SameSite=Strict`
        )
        .expect(200, { idToken: 'id token' });
    });

    it('should return 400 when code param is missing', async () => {
      await request(app)
        .post('/token')
        .send({ codeVerifier: 'code verifier' })
        .expect('Content-Type', /text/)
        .expect(400);
    });

    it('should return 400 when codeVerifier param is missing', async () => {
      await request(app).post('/token').send({ code: 'code' }).expect('Content-Type', /text/).expect(400);
    });

    it('should return 401 when code or codeVerifier param is invalid', async () => {
      jest.spyOn(service, 'handleAuthorizationCode').mockRejectedValue(new Error());

      await request(app)
        .post('/token')
        .send({ code: 'code', codeVerifier: 'code verifier' })
        .expect('Content-Type', /text/)
        .expect(401);
    });
  });

  describe('getAuthorizationCodeUrl tests', () => {
    it('should return 200 and the authorization code url when the stateVerifier and codeChallenge params are valid', async () => {
      const authorizationCodeUrl = 'authorizationCodeUrl';
      jest.spyOn(service, 'getAuthorizationCodeUrl').mockReturnValue(authorizationCodeUrl);

      await request(app)
        .get('/login?stateVerifier=stateVerifier&codeChallenge=codeChallenge')
        .expect('Content-Type', /json/)
        .expect(200, { redirectUrl: authorizationCodeUrl });
    });

    it('should return 401 when stateVerifier param is missing', async () => {
      await request(app).get('/login?codeChallenge=codeChallenge').expect('Content-Type', /text/).expect(400);
    });

    it('should return 401 when codeChallenge param is missing', async () => {
      await request(app).get('/login?stateVerifier=stateVerifier').expect('Content-Type', /text/).expect(400);
    });
  });

  describe('verifyToken tests', () => {
    it('should continue to the next middleware when the access_token cookie is set and is valid', async () => {
      const user = {
        id: 'user id',
        roles: ['role']
      };
      jest.spyOn(service, 'validateToken').mockResolvedValue({});
      jest.spyOn(service, 'getUserIdFromToken').mockReturnValue(user.id);
      jest.spyOn(service, 'getUserRolesFromToken').mockReturnValue(user.roles);

      await request(app)
        .get('/pro')
        .set('Cookie', 'access_token=validToken')
        .expect('Content-Type', /json/)
        .expect(200, { user });
    });

    it('should return 401 when access_token cookie is missing', async () => {
      await request(app).get('/pro').expect('Content-Type', /text/).expect(401);
    });

    it('should return 401 when access_token cookie is invalid', async () => {
      jest.spyOn(service, 'validateToken').mockRejectedValue(new Error());

      await request(app)
        .get('/pro')
        .set('Cookie', 'access_token=validToken')
        .expect('Content-Type', /text/)
        .expect(401);
    });
  });

  describe('logoutUser tests', () => {
    it('should return 200, clear cookies, and revoke refresh token when refresh_token cookie is present and valid', async () => {
      jest.spyOn(service, 'revokeToken').mockResolvedValue();

      await request(app)
        .get('/logout')
        .set('Cookie', ['access_token=validToken', 'refresh_token=validToken'])
        .expect('Content-Type', /text/)
        .expect(
          'set-cookie',
          'access_token=cleared; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT,refresh_token=cleared; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        )
        .expect(200);
    });

    it('should return 200 and clear cookies when refresh_token cookie is missing', async () => {
      await request(app)
        .get('/logout')
        .set('Cookie', 'access_token=validToken')
        .expect('Content-Type', /text/)
        .expect(
          'set-cookie',
          'access_token=cleared; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT,refresh_token=cleared; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        )
        .expect(200);
    });

    it('should return 200 and clear cookies when refresh_token cookie is invalid', async () => {
      jest.spyOn(service, 'revokeToken').mockRejectedValue(new Error());

      await request(app)
        .get('/logout')
        .set('Cookie', ['access_token=validToken', 'refresh_token=invalidToken'])
        .expect('Content-Type', /text/)
        .expect(
          'set-cookie',
          'access_token=cleared; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT,refresh_token=cleared; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        )
        .expect(200);
    });
  });

  describe('refreshAccessToken tests', () => {
    it('should return 200, the id token in the response body, and set the access token as a cookie when the refresh_token cookie is present and valid', async () => {
      const accessExpires = new Date(tokens.accessToken.expiresIn * 1000).toUTCString();
      jest.spyOn(service, 'refreshAccessToken').mockResolvedValue(tokens);
      jest.spyOn(Date, 'now').mockImplementation(() => 0);

      await request(app)
        .get('/refresh')
        .set('Cookie', 'refresh_token=validToken')
        .expect('Content-Type', /json/)
        .expect(
          'set-cookie',
          `access_token=access%20token; Path=/; Expires=${accessExpires}; HttpOnly; Secure; SameSite=Strict`
        )
        .expect(200, { idToken: 'id token' });
    });

    it('should return 401 when refresh_token cookie is missing', async () => {
      await request(app).get('/refresh').expect('Content-Type', /text/).expect(401);
    });

    it('should return 401 when refresh_token cookie is invalid', async () => {
      jest.spyOn(service, 'refreshAccessToken').mockRejectedValue(new Error());

      await request(app)
        .get('/refresh')
        .set('Cookie', 'refresh_token=invalidToken')
        .expect('Content-Type', /text/)
        .expect(401);
    });
  });
});
