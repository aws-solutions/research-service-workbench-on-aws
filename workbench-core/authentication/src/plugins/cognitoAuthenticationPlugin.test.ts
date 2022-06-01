jest.mock('../utils');

import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommandOutput,
  NotAuthorizedException,
  ResourceNotFoundException,
  TimeUnitsType
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import axios from 'axios';
import {
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions,
  InvalidAuthorizationCodeError,
  InvalidCodeVerifierError,
  InvalidJWTError,
  InvalidTokenError,
  InvalidTokenTypeError,
  PluginConfigurationError
} from '..';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  region: 'us-west-2',
  cognitoDomain: 'fake-domain',
  userPoolId: 'us-west-2_fakeId',
  clientId: 'fake-client-id',
  clientSecret: 'fake-client-secret',
  websiteUrl: 'fake-website-url'
} as const;

const baseUrl = `${cognitoPluginOptions.cognitoDomain}/oauth2`;

const encodedClientId = Buffer.from(
  `${cognitoPluginOptions.clientId}:${cognitoPluginOptions.clientSecret}`
).toString('base64');

const userPoolClientInfo: Partial<DescribeUserPoolClientCommandOutput> = {
  UserPoolClient: {
    TokenValidityUnits: {
      IdToken: TimeUnitsType.HOURS,
      AccessToken: TimeUnitsType.MINUTES,
      RefreshToken: TimeUnitsType.DAYS
    },
    RefreshTokenValidity: 1,
    IdTokenValidity: 1,
    AccessTokenValidity: 1
  }
} as const;

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
      new InvalidTokenTypeError('only refresh tokens may be revoked')
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

  it('handleAuthorizationCode should exchange the authorization code for tokens when the code is valid', async () => {
    const validCode = 'validCode';
    const codeVerifier = 'codeVerifier';
    const fakeTokens = {
      data: {
        id_token: 'id token',
        access_token: 'access token',
        refresh_token: 'refresh token'
      }
    };
    const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce(fakeTokens);
    jest
      .spyOn(CognitoIdentityProviderClient.prototype, 'send')
      .mockImplementationOnce(() => Promise.resolve(userPoolClientInfo));

    const tokens = await plugin.handleAuthorizationCode(validCode, codeVerifier);

    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: validCode,
        redirect_uri: cognitoPluginOptions.websiteUrl,
        code_verifier: codeVerifier
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
    expect(tokens).toMatchObject({
      idToken: {
        token: 'id token',
        expiresIn: 1
      },
      accessToken: {
        token: 'access token',
        expiresIn: 1
      },
      refreshToken: {
        token: 'refresh token',
        expiresIn: 1
      }
    });
  });

  it('handleAuthorizationCode should throw InvalidAuthorizationCodeError when an invalid authorization code is passed in', async () => {
    const invalidCode = 'invalidCode';
    const codeVerifier = 'codeVerifier';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_grant' } } });

    await expect(plugin.handleAuthorizationCode(invalidCode, codeVerifier)).rejects.toThrow(
      new InvalidAuthorizationCodeError('authorization code has been used already or is invalid')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        redirect_uri: cognitoPluginOptions.websiteUrl,
        code_verifier: codeVerifier
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
    const codeVerifier = 'codeVerifier';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_client' } } });

    await expect(plugin.handleAuthorizationCode(invalidCode, codeVerifier)).rejects.toThrow(
      new PluginConfigurationError('invalid client id or client secret')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        redirect_uri: cognitoPluginOptions.websiteUrl,
        code_verifier: codeVerifier
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
    const codeVerifier = 'codeVerifier';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'unauthorized_client' } } });

    await expect(plugin.handleAuthorizationCode(invalidCode, codeVerifier)).rejects.toThrow(
      new PluginConfigurationError('authorization code grant is disabled for this app client')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        redirect_uri: cognitoPluginOptions.websiteUrl,
        code_verifier: codeVerifier
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('handleAuthorizationCode should throw InvalidCodeVerifierError when the code verifier is invalid', async () => {
    const validCode = 'validCode';
    const invalidCodeVerifier = 'invalidCodeVerifier';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_request' } } });

    await expect(plugin.handleAuthorizationCode(validCode, invalidCodeVerifier)).rejects.toThrow(
      new InvalidCodeVerifierError('pkce code verifier is invalid')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: validCode,
        redirect_uri: cognitoPluginOptions.websiteUrl,
        code_verifier: invalidCodeVerifier
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
    const codeVerifier = 'codeVerifier';
    const axiosSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error());

    await expect(plugin.handleAuthorizationCode(invalidCode, codeVerifier)).rejects.toThrow(Error);
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: invalidCode,
        redirect_uri: cognitoPluginOptions.websiteUrl,
        code_verifier: codeVerifier
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
    const state = 'TEMP_STATE';
    const codeChallenge = 'TEMP_CODE_CHALLENGE';
    const url = plugin.getAuthorizationCodeUrl(state, codeChallenge);

    expect(url).toBe(
      `${baseUrl}/authorize?client_id=${cognitoPluginOptions.clientId}&response_type=code&scope=openid&redirect_uri=${cognitoPluginOptions.websiteUrl}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`
    );
  });

  it('refreshAccessToken should retrieve new id and access tokens from Cognito when the refresh token is valid', async () => {
    const refreshToken = 'refreshToken';
    const fakeTokens = {
      data: {
        id_token: 'id token',
        access_token: 'access token'
      }
    };
    const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce(fakeTokens);
    jest
      .spyOn(CognitoIdentityProviderClient.prototype, 'send')
      .mockImplementationOnce(() => Promise.resolve(userPoolClientInfo));

    const tokens = await plugin.refreshAccessToken(refreshToken);

    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
    expect(tokens).toMatchObject({
      idToken: {
        token: 'id token',
        expiresIn: 1
      },
      accessToken: {
        token: 'access token',
        expiresIn: 1
      }
    });
  });

  it('refreshAccessToken should throw InvalidTokenError when an invalid refresh token is passed in', async () => {
    const invalidRefreshToken = 'invalidRefreshToken';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_grant' } } });

    await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(
      new InvalidTokenError('refresh token is invalid or has been revoked')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: invalidRefreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('refreshAccessToken should throw PluginConfigurationError when the client id or secret is invalid', async () => {
    const invalidRefreshToken = 'invalidRefreshToken';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'invalid_client' } } });

    await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(
      new PluginConfigurationError('invalid client id or client secret')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: invalidRefreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('refreshAccessToken should throw PluginConfigurationError when refreshing access tokens is disabled for the app client', async () => {
    const invalidRefreshToken = 'invalidRefreshToken';
    const axiosSpy = jest
      .spyOn(axios, 'post')
      .mockRejectedValueOnce({ response: { data: { error: 'unauthorized_client' } } });

    await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(
      new PluginConfigurationError('refreshing access tokens is disabled for this app client')
    );
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: invalidRefreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('refreshAccessToken should rethrow an error when the error is unexpected', async () => {
    const invalidRefreshToken = 'invalidRefreshToken';
    const axiosSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error());

    await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(Error);
    expect(axiosSpy).toHaveBeenCalledWith(
      `${baseUrl}/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: invalidRefreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedClientId}`
        }
      }
    );
  });

  it('_getEncodedClientId should return a base64 encoded string representation of clientId:clientSecret', () => {
    const encodedId = plugin['_getEncodedClientId']();

    expect(encodedId).toBe(encodedClientId);
  });

  it('_getEncodedClientId should return a TokensExpiration object when user pool has token expiration defined', async () => {
    jest
      .spyOn(CognitoIdentityProviderClient.prototype, 'send')
      .mockImplementationOnce(() => Promise.resolve(userPoolClientInfo));

    const tokens = await plugin['_getTokensExpiration']();

    expect(tokens).toMatchObject({ idToken: 1, accessToken: 1, refreshToken: 1 });
  });

  it('_getEncodedClientId should return an empty TokensExpiration object when user pool doesnt have token expiration defined', async () => {
    jest
      .spyOn(CognitoIdentityProviderClient.prototype, 'send')
      .mockImplementationOnce(() => Promise.resolve({}));

    const tokens = await plugin['_getTokensExpiration']();

    expect(tokens).toMatchObject({});
  });

  it('_getEncodedClientId should throw PluginConfigurationError when the service doesnt have correct permissions', async () => {
    jest
      .spyOn(CognitoIdentityProviderClient.prototype, 'send')
      .mockImplementationOnce(() => Promise.reject(new NotAuthorizedException({ $metadata: {} })));

    await expect(plugin['_getTokensExpiration']()).rejects.toThrow(
      new PluginConfigurationError('service is not authorized to perform this action. Check IAM permissions')
    );
  });

  it('_getEncodedClientId should throw PluginConfigurationError when the service doesnt have correct permissions', async () => {
    jest
      .spyOn(CognitoIdentityProviderClient.prototype, 'send')
      .mockImplementationOnce(() => Promise.reject(new ResourceNotFoundException({ $metadata: {} })));

    await expect(plugin['_getTokensExpiration']()).rejects.toThrow(
      new PluginConfigurationError('invalid user pool id or client id')
    );
  });

  it('_getEncodedClientId should rethrow an error when the error is unexpected', async () => {
    jest
      .spyOn(CognitoIdentityProviderClient.prototype, 'send')
      .mockImplementationOnce(() => Promise.reject(new Error()));

    await expect(plugin['_getTokensExpiration']()).rejects.toThrow(Error);
  });
});
