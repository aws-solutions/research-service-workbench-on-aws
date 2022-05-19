jest.mock('./plugins/cognitoAuthenticationPlugin');

import { AuthenticationService, CognitoAuthenticationPlugin, CognitoAuthenticationPluginOptions } from '.';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: 'fake-domain',
  userPoolId: 'fake-user-pool',
  clientId: 'fake-client-id',
  clientSecret: 'fake-client-secret',
  loginUrl: 'fake-login-url'
};

describe('AuthenticationService tests', () => {
  const mockPlugin = new CognitoAuthenticationPlugin(cognitoPluginOptions);
  const service = new AuthenticationService(mockPlugin);

  it('constructor should set the private _authenticationPlugin field to the authenticationPlugin parameter', () => {
    expect(service['_authenticationPlugin']).toBeInstanceOf(CognitoAuthenticationPlugin); // nosemgrep
  });

  it('isUserLoggedIn should be true when a valid token is passed in', async () => {
    const result = await service.isUserLoggedIn('valid token');

    expect(result).toBe(true);
  });

  it('isUserLoggedIn should be false when an invalid token is passed in', async () => {
    const result = await service.isUserLoggedIn('');

    expect(result).toBe(false);
  });

  it('validateToken should return the decoded passed in token', async () => {
    const result = await service.validateToken('valid token');

    expect(result).toMatchObject({
      token_use: 'access',
      sub: 'sub',
      iss: 'iss',
      exp: 3600,
      iat: 123,
      auth_time: 456,
      jti: 'jti',
      origin_jti: 'origin_jti'
    });
  });

  it('revokeToken should successfully call the plugins revokeToken() method', async () => {
    const revokeSpy = jest.spyOn(mockPlugin, 'revokeToken');
    await service.revokeToken('valid token');

    expect(revokeSpy).lastCalledWith('valid token');
  });

  it('getUserIdFromToken should return the tokens user id', () => {
    const result = service.getUserIdFromToken({});

    expect(result).toBe('id');
  });

  it('getUserRolesFromToken should return the tokens roles', () => {
    const result = service.getUserRolesFromToken({});

    expect(result).toMatchObject(['role']);
  });

  it('handleAuthorizationCode should return a Promise that contains the id, access, and refresh tokens', async () => {
    const result = await service.handleAuthorizationCode('access code');

    expect(result).toMatchObject({
      idToken: 'id token',
      accessToken: 'access token',
      refreshToken: 'refresh token',
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  });

  it('getAuthorizationCodeUrl should return the full URL of the authentication servers authorization code endpoint', () => {
    const url = service.getAuthorizationCodeUrl();

    expect(url).toBe('authorizationCodeUrl');
  });
});
