import axios from 'axios';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import {
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions,
  InvalidAuthorizationCodeError,
  InvalidJWTError,
  InvalidTokenTypeError,
  PluginConfigurationError
} from '..';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: 'fake-domain',
  userPoolId: 'us-west-2_fakeId',
  clientId: 'fake-client-id',
  clientSecret: 'fake-client-secret',
  loginUrl: 'fake-login-url'
};

const baseUrl = `${cognitoPluginOptions.cognitoDomain}/oauth2`;
const encodedClientId = Buffer.from(
  `${cognitoPluginOptions.clientId}:${cognitoPluginOptions.clientSecret}`
).toString('base64');

describe('CognitoAuthenticationPlugin tests', () => {
  const plugin = new CognitoAuthenticationPlugin(cognitoPluginOptions);

  it('constructor should throw PluginConfigurationError when the user pool id is invalid. Must match "<region>_<some string>" format', () => {
    const badUserPoolIdConfig = { ...cognitoPluginOptions, userPoolId: 'badId' };

    expect(() => {
      new CognitoAuthenticationPlugin(badUserPoolIdConfig);
    }).toThrow(PluginConfigurationError);
  });

  it('isUserLoggedIn should be true when a valid token is passed in', async () => {
    const validToken = 'validToken';
    const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce('valid');

    const loggedIn = await plugin.isUserLoggedIn(validToken);

    expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/userInfo`, {
      headers: { Authorization: `Bearer ${validToken}` }
    });
    expect(loggedIn).toBe(true);
  });

  it('isUserLoggedIn should be false when an invalid token is passed in', async () => {
    const invalidToken = 'invalidToken';
    const axiosSpy = jest.spyOn(axios, 'get').mockRejectedValueOnce('invalid');

    const loggedIn = await plugin.isUserLoggedIn(invalidToken);

    expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/userInfo`, {
      headers: { Authorization: `Bearer ${invalidToken}` }
    });
    expect(loggedIn).toBe(false);
  });

  it('validateToken should return the decoded token when a valid token is passed in', async () => {
    const decodedToken: CognitoJwtPayload = {
      token_use: 'access',
      sub: 'sub',
      iss: 'iss',
      exp: 3600,
      iat: 123,
      auth_time: 456,
      jti: 'jti',
      origin_jti: 'origin_jti'
    };
    jest.spyOn(CognitoJwtVerifier.prototype, 'verify').mockResolvedValueOnce(decodedToken);

    const decoded = await plugin.validateToken('validToken');

    expect(decoded).toMatchObject(decodedToken);
  });

  it('validateToken should throw InvalidJWTError when an invalid token is passed in', async () => {
    const invalidToken = 'invalidToken';
    const verifierSpy = jest.spyOn(CognitoJwtVerifier.prototype, 'verify').mockRejectedValueOnce(new Error());

    await expect(plugin.validateToken(invalidToken)).rejects.toThrow(new InvalidJWTError('token is invalid'));
    expect(verifierSpy).toHaveBeenCalledWith(invalidToken);
  });

  it('revokeToken should revoke the refresh token when passed in', async () => {
    const validToken = 'validToken';
    const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce('revoked');

    await plugin.revokeToken(validToken);

    expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/revoke`, new URLSearchParams({ token: validToken }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedClientId}`
      }
    });
  });

  it('revokeToken should throw InvalidTokenTypeError when a non-refresh token is passed in', async () => {
    const invalidToken = 'invalidToken';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'unsupported_token_type' } } });

    await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(
      new InvalidTokenTypeError('only access tokens may be revoked')
    );
    expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/revoke`, new URLSearchParams({ token: invalidToken }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedClientId}`
      }
    });
  });

  it('revokeToken should throw PluginConfigurationError when token revocation is disabled for the app client', async () => {
    const invalidToken = 'invalidToken';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_request' } } });

    await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(
      new PluginConfigurationError('token revocation is disabled for this app client')
    );
    expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/revoke`, new URLSearchParams({ token: invalidToken }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedClientId}`
      }
    });
  });

  it('revokeToken should throw PluginConfigurationError when the client id or secret is invalid', async () => {
    const invalidToken = 'invalidToken';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_client' } } });

    await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(
      new PluginConfigurationError('invalid client id or client secret')
    );
    expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/revoke`, new URLSearchParams({ token: invalidToken }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedClientId}`
      }
    });
  });

  it('revokeToken should rethrow an error when the error is unexpected', async () => {
    const invalidToken = 'invalidToken';
    const axiosSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error());

    await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(Error);
    expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/revoke`, new URLSearchParams({ token: invalidToken }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedClientId}`
      }
    });
  });

  it('getUserIdFromToken should return the sub claim from the decoded token', () => {
    const decodedToken: CognitoJwtPayload = {
      token_use: 'access',
      sub: 'sub',
      iss: 'iss',
      exp: 3600,
      iat: 123,
      auth_time: 456,
      jti: 'jti',
      origin_jti: 'origin_jti'
    };

    const userId = plugin.getUserIdFromToken(decodedToken);

    expect(userId).toBe('sub');
  });

  it('getUserRolesFromToken should return the cognito:groups claim from the decoded token', () => {
    const decodedToken: CognitoJwtPayload = {
      token_use: 'access',
      sub: 'sub',
      iss: 'iss',
      exp: 3600,
      iat: 123,
      auth_time: 456,
      jti: 'jti',
      origin_jti: 'origin_jti',
      'cognito:groups': ['Admin']
    };

    const userId = plugin.getUserRolesFromToken(decodedToken);

    expect(userId).toMatchObject(['Admin']);
  });

  it('getUserRolesFromToken should throw InvalidJWTError when the decoded token doesnt have the cognito:groups claim', () => {
    const decodedToken: CognitoJwtPayload = {
      token_use: 'access',
      sub: 'sub',
      iss: 'iss',
      exp: 3600,
      iat: 123,
      auth_time: 456,
      jti: 'jti',
      origin_jti: 'origin_jti'
    };

    expect(() => {
      plugin.getUserRolesFromToken(decodedToken);
    }).toThrow(new InvalidJWTError('no cognito:roles claim'));
  });

  it('handleAuthorizationCode should exchange the authroization code for tokens when the code is vallid', async () => {
    const validCode = 'validCode';
    const fakeTokens = {
      data: {
        id_token: 'id token',
        access_token: 'access token',
        refresh_token: 'refresh token',
        token_type: 'Bearer',
        expires_in: 3600
      }
    };
    const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce(fakeTokens);

    const tokens = await plugin.handleAuthorizationCode(validCode);

    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: validCode,
        client_id: cognitoPluginOptions.clientId,
        redirect_uri: cognitoPluginOptions.loginUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
    expect(tokens).toMatchObject({
      idToken: 'id token',
      accessToken: 'access token',
      refreshToken: 'refresh token',
      expiresIn: 3600
    });
  });

  it('handleAuthorizationCode should throw InvalidAuthorizationCodeError when an invalid authorization token is passed in', async () => {
    const invalidCode = 'invalidCode';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_grant' } } });

    await expect(plugin.handleAuthorizationCode(invalidCode)).rejects.toThrow(
      new InvalidAuthorizationCodeError('authorization code has been used already or is invalid')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        client_id: cognitoPluginOptions.clientId,
        redirect_uri: cognitoPluginOptions.loginUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('handleAuthorizationCode should throw PluginConfigurationError when the client id or secret is invalid', async () => {
    const invalidCode = 'invalidCode';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_client' } } });

    await expect(plugin.handleAuthorizationCode(invalidCode)).rejects.toThrow(
      new PluginConfigurationError('invalid client id or client secret')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        client_id: cognitoPluginOptions.clientId,
        redirect_uri: cognitoPluginOptions.loginUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('handleAuthorizationCode should throw PluginConfigurationError when the authorization code grant is disabled for the app client', async () => {
    const invalidCode = 'invalidCode';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'unauthorized_client' } } });

    await expect(plugin.handleAuthorizationCode(invalidCode)).rejects.toThrow(
      new PluginConfigurationError('authorization code grant is disabled for this app client')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        client_id: cognitoPluginOptions.clientId,
        redirect_uri: cognitoPluginOptions.loginUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('handleAuthorizationCode should rethrow an error when the error is unexpected', async () => {
    const invalidCode = 'invalidCode';
    const axiosSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error());

    await expect(plugin.handleAuthorizationCode(invalidCode)).rejects.toThrow(Error);
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        client_id: cognitoPluginOptions.clientId,
        redirect_uri: cognitoPluginOptions.loginUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('getAuthorizationCodeUrl should return the full URL of the authentication servers authorization code endpoint', () => {
    const url = plugin.getAuthorizationCodeUrl();

    expect(url).toBe(
      `${baseUrl}/authorize?client_id=${cognitoPluginOptions.clientId}&response_type=code&scope=openid&redirect_uri=${cognitoPluginOptions.loginUrl}`
    );
  });
});
