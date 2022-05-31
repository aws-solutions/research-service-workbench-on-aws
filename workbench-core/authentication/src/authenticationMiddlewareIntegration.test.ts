jest.mock('./authenticationService');
jest.mock('./plugins/cognitoAuthenticationPlugin');

import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import request from 'supertest';
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

    jest.spyOn(Date, 'now').mockImplementation(() => 0);
  });

  describe('getTokensFromAuthorizationCode tests', () => {
    it('should return 200, the id token in the response body, and set the access and refresh tokens as cookies when the code and codeVerifier params are valid', async () => {
      const accessExpires = new Date(tokens.accessToken.expiresIn * 1000).toUTCString();
      const refreshExpires = new Date(tokens.refreshToken.expiresIn * 1000).toUTCString();

      await request(app)
        .post('/token')
        .send({ code: 'validCode', codeVerifier: 'validCodeVerifier' })
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
        .send({ codeVerifier: 'validCodeVerifier' })
        .expect('Content-Type', /text/)
        .expect(400);
    });

    it('should return 400 when codeVerifier param is missing', async () => {
      await request(app)
        .post('/token')
        .send({ code: 'validCode' })
        .expect('Content-Type', /text/)
        .expect(400);
    });

    it('should return 401 when code or codeVerifier param is invalid', async () => {
      await request(app)
        .post('/token')
        .send({ code: 'invalidCode', codeVerifier: 'invalidCodeVerifier' })
        .expect('Content-Type', /text/)
        .expect(401);
    });
  });

  describe('getAuthorizationCodeUrl tests', () => {
    it('should return 200 and the authorization code url when the stateVerifier and codeChallenge params are valid', async () => {
      const state = 'stateVerifier';
      const codeChallenge = 'codeChallenge';

      await request(app)
        .get(`/login?stateVerifier=${state}&codeChallenge=${codeChallenge}`)
        .expect('Content-Type', /json/)
        .expect(200, {
          redirectUrl: `https://www.fakeurl.com/authorize?client_id=fake-id&response_type=code&scope=openid&redirect_uri=https://www.fakewebsite.com&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`
        });
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
      await request(app)
        .get('/pro')
        .set('Cookie', 'access_token=validToken')
        .expect('Content-Type', /json/)
        .expect(200, {
          user: {
            id: 'id',
            roles: ['role']
          }
        });
    });

    it('should return 401 when access_token cookie is missing', async () => {
      await request(app).get('/pro').expect('Content-Type', /text/).expect(401);
    });

    it('should return 401 when access_token cookie is invalid', async () => {
      await request(app)
        .get('/pro')
        .set('Cookie', 'access_token=invalidToken')
        .expect('Content-Type', /text/)
        .expect(401);
    });
  });

  describe('logoutUser tests', () => {
    it('should return 200, clear cookies, and revoke refresh token when refresh_token cookie is present and valid', async () => {
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
      await request(app)
        .get('/refresh')
        .set('Cookie', 'refresh_token=invalidToken')
        .expect('Content-Type', /text/)
        .expect(401);
    });
  });
});
