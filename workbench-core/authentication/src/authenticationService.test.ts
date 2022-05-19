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
  it('constructor should set the private _authenticationPlugin field to the authenticationPlugin parameter', () => {
    const authnService = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    expect(authnService['_authenticationPlugin']).toBeInstanceOf(CognitoAuthenticationPlugin); // nosemgrep
  });

  it('isUserLoggedIn should be true when a valid token is passed in', async () => {
    const service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    const result = await service.isUserLoggedIn('valid token');

    expect(result).toBe(true);
  });

  it('isUserLoggedIn should be false when an invalid token is passed in', async () => {
    const service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    const result = await service.isUserLoggedIn('');

    expect(result).toBe(false);
  });

  it('validateToken should return the decoded passed in token', () => {
    const service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    const result = service.validateToken('valid token');

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
    const pi = new CognitoAuthenticationPlugin(cognitoPluginOptions);
    const service = new AuthenticationService(pi);

    const revokeSpy = jest.spyOn(pi, 'revokeToken');
    await service.revokeToken('valid token');

    expect(revokeSpy).lastCalledWith('valid token');
  });

  it('getUserIdFromToken should return the tokens user id', () => {
    const service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    const result = service.getUserIdFromToken({});

    expect(result).toBe('id');
  });

  it('getUserRolesFromToken should return the tokens roles', () => {
    const service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    const result = service.getUserRolesFromToken({});

    expect(result).toMatchObject(['role']);
  });

  it('handleAuthorizationCode should return a Promise that contains the id, access, and refresh tokens', async () => {
    const service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

    const result = await service.handleAuthorizationCode('access code');

    expect(result).toMatchObject({
      idToken: 'id token',
      accessToken: 'access token',
      refreshToken: 'refresh token',
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  });
});
