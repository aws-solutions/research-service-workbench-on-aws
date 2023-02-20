/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../utils');

import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  DescribeUserPoolClientCommandOutput,
  NotAuthorizedException,
  ResourceNotFoundException,
  TimeUnitsType
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import { mockClient } from 'aws-sdk-client-mock';
import axios from 'axios';
import {
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions,
  IdpUnavailableError,
  InvalidAuthorizationCodeError,
  InvalidCodeVerifierError,
  InvalidJWTError,
  InvalidTokenError,
  InvalidTokenTypeError,
  PluginConfigurationError
} from '..';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: 'fake-domain',
  userPoolId: 'us-west-2_fakeId',
  clientId: 'fake-client-id',
  clientSecret: 'fake-client-secret'
} as const;

const baseUrl = cognitoPluginOptions.cognitoDomain;

const websiteUrl = 'https://www.fakewebsite.com';
const validToken = 'validToken';
const invalidToken = 'invalidToken';

const encodedClientId = Buffer.from(
  `${cognitoPluginOptions.clientId}:${cognitoPluginOptions.clientSecret}`
).toString('base64');

const baseDecodedAccessToken: CognitoAccessTokenPayload = {
  token_use: 'access',
  client_id: 'client_id',
  version: 1,
  username: 'username',
  scope: 'scope',
  sub: 'sub',
  iss: 'iss',
  exp: 3600,
  iat: 123,
  auth_time: 456,
  jti: 'jti',
  origin_jti: 'origin_jti'
};

const cognitoMock = mockClient(CognitoIdentityProviderClient);

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
  let plugin: CognitoAuthenticationPlugin;

  beforeEach(() => {
    cognitoMock.reset();
    plugin = new CognitoAuthenticationPlugin(cognitoPluginOptions);
  });

  describe('constructor tests', () => {
    it('should throw PluginConfigurationError when the user pool id is invalid. Must match "<region>_<some string>" format', () => {
      const badUserPoolIdConfig = { ...cognitoPluginOptions, userPoolId: 'badId' };

      expect(() => {
        new CognitoAuthenticationPlugin(badUserPoolIdConfig);
      }).toThrow(PluginConfigurationError);
    });

    it('should throw PluginConfigurationError when the verifier throws an error', () => {
      jest.spyOn(CognitoJwtVerifier, 'create').mockImplementationOnce(() => {
        throw new Error();
      });

      expect(() => {
        new CognitoAuthenticationPlugin(cognitoPluginOptions);
      }).toThrow(PluginConfigurationError);
    });
  });

  describe('isUserLoggedIn tests', () => {
    it('should be true when a valid token is passed in', async () => {
      const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce('valid');

      const loggedIn = await plugin.isUserLoggedIn(validToken);

      expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/oauth2/userInfo`, {
        headers: { Authorization: `Bearer ${validToken}` }
      });
      expect(loggedIn).toBe(true);
    });

    it('should be false when an invalid token is passed in', async () => {
      const axiosSpy = jest.spyOn(axios, 'get').mockRejectedValueOnce('invalid');

      const loggedIn = await plugin.isUserLoggedIn(invalidToken);

      expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/oauth2/userInfo`, {
        headers: { Authorization: `Bearer ${invalidToken}` }
      });
      expect(loggedIn).toBe(false);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      const axiosSpy = jest.spyOn(axios, 'get').mockRejectedValueOnce({ response: { status: 500 } });

      await expect(plugin.isUserLoggedIn(validToken)).rejects.toThrow(
        new IdpUnavailableError('Cognito is unavailable')
      );
      expect(axiosSpy).toHaveBeenCalledWith(`${baseUrl}/oauth2/userInfo`, {
        headers: { Authorization: `Bearer ${validToken}` }
      });
    });
  });

  describe('validateToken tests', () => {
    it('should return the decoded token when a valid token is passed in', async () => {
      jest.spyOn(CognitoJwtVerifier.prototype, 'verify').mockResolvedValueOnce(baseDecodedAccessToken);

      const decoded = await plugin.validateToken('validToken');

      expect(decoded).toMatchObject(baseDecodedAccessToken);
    });

    it('should throw InvalidJWTError when an invalid token is passed in', async () => {
      const verifierSpy = jest
        .spyOn(CognitoJwtVerifier.prototype, 'verify')
        .mockRejectedValueOnce(new Error());

      await expect(plugin.validateToken(invalidToken)).rejects.toThrow(
        new InvalidJWTError('token is invalid')
      );
      expect(verifierSpy).toHaveBeenCalledWith(invalidToken);
    });
  });

  describe('revokeToken tests', () => {
    it('should revoke the refresh token when passed in', async () => {
      const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce('revoked');

      await plugin.revokeToken(validToken);

      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/revoke`,
        new URLSearchParams({ token: validToken }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should throw InvalidTokenTypeError when a non-refresh token is passed in', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'unsupported_token_type' } } });

      await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(
        new InvalidTokenTypeError('only refresh tokens may be revoked')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/revoke`,
        new URLSearchParams({ token: invalidToken }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should throw PluginConfigurationError when token revocation is disabled for the app client', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'invalid_request' } } });

      await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(
        new PluginConfigurationError('token revocation is disabled for this app client')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/revoke`,
        new URLSearchParams({ token: invalidToken }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should throw PluginConfigurationError when the client id or secret is invalid', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'invalid_client' } } });

      await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(
        new PluginConfigurationError('invalid client id or client secret')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/revoke`,
        new URLSearchParams({ token: invalidToken }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { status: 500, data: {} } });

      await expect(plugin.revokeToken(validToken)).rejects.toThrow(
        new IdpUnavailableError('Cognito is unavailable')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/revoke`,
        new URLSearchParams({ token: validToken }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      const axiosSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error());

      await expect(plugin.revokeToken(invalidToken)).rejects.toThrow(Error);
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/revoke`,
        new URLSearchParams({ token: invalidToken }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });
  });

  describe('getUserIdFromToken tests', () => {
    it('should return the sub claim from the decoded token', () => {
      const userId = plugin.getUserIdFromToken(baseDecodedAccessToken);

      expect(userId).toBe('sub');
    });

    it('should return the cognito:groups claim from the decoded token', () => {
      const userId = plugin.getUserRolesFromToken({
        ...baseDecodedAccessToken,
        'cognito:groups': ['Admin']
      });

      expect(userId).toMatchObject(['Admin']);
    });

    it('should throw InvalidJWTError when the decoded token doesnt have the cognito:groups claim', () => {
      expect(() => {
        plugin.getUserRolesFromToken(baseDecodedAccessToken);
      }).toThrow(new InvalidJWTError('no cognito:roles claim'));
    });
  });

  describe('handleAuthorizationCode tests', () => {
    const validCode = 'validCode';
    const invalidCode = 'invalidCode';
    const validCodeVerifier = 'validCodeVerifier';
    const invalidCodeVerifier = 'invalidCodeVerifier';

    it('should exchange the authorization code for tokens when the code is valid', async () => {
      const fakeTokens = {
        data: {
          id_token: 'id token',
          access_token: 'access token',
          refresh_token: 'refresh token'
        }
      };
      const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce(fakeTokens);
      cognitoMock.on(DescribeUserPoolClientCommand).resolves(userPoolClientInfo);

      const tokens = await plugin.handleAuthorizationCode(validCode, validCodeVerifier, websiteUrl);

      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: validCode,
          redirect_uri: websiteUrl,
          code_verifier: validCodeVerifier
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

    it('should throw InvalidAuthorizationCodeError when an invalid authorization code is passed in', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'invalid_grant' } } });

      await expect(
        plugin.handleAuthorizationCode(invalidCode, validCodeVerifier, websiteUrl)
      ).rejects.toThrow(
        new InvalidAuthorizationCodeError('authorization code has been used already or is invalid')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: invalidCode,
          redirect_uri: websiteUrl,
          code_verifier: validCodeVerifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should throw PluginConfigurationError when the client id or secret is invalid', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'invalid_client' } } });

      await expect(plugin.handleAuthorizationCode(validCode, validCodeVerifier, websiteUrl)).rejects.toThrow(
        new PluginConfigurationError('invalid client id or client secret')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: validCode,
          redirect_uri: websiteUrl,
          code_verifier: validCodeVerifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should throw PluginConfigurationError when the authorization code grant is disabled for the app client', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'unauthorized_client' } } });

      await expect(plugin.handleAuthorizationCode(validCode, validCodeVerifier, websiteUrl)).rejects.toThrow(
        new PluginConfigurationError('authorization code grant is disabled for this app client')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: validCode,
          redirect_uri: websiteUrl,
          code_verifier: validCodeVerifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should throw InvalidCodeVerifierError when the code verifier is invalid', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'invalid_request' } } });

      await expect(
        plugin.handleAuthorizationCode(validCode, invalidCodeVerifier, websiteUrl)
      ).rejects.toThrow(new InvalidCodeVerifierError('pkce code verifier is invalid'));
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: validCode,
          redirect_uri: websiteUrl,
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

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { status: 500, data: {} } });

      await expect(plugin.handleAuthorizationCode(validCode, validCodeVerifier, websiteUrl)).rejects.toThrow(
        new IdpUnavailableError('Cognito is unavailable')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: validCode,
          redirect_uri: websiteUrl,
          code_verifier: validCodeVerifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      const axiosSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error());

      await expect(plugin.handleAuthorizationCode(validCode, validCodeVerifier, websiteUrl)).rejects.toThrow(
        Error
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: validCode,
          redirect_uri: websiteUrl,
          code_verifier: validCodeVerifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });
  });

  describe('getAuthorizationCodeUrl tests', () => {
    it('should return the full URL of the authentication servers authorization code endpoint', () => {
      const state = 'TEMP_STATE';
      const codeChallenge = 'TEMP_CODE_CHALLENGE';
      const url = plugin.getAuthorizationCodeUrl(state, codeChallenge, websiteUrl);

      expect(url).toBe(
        `${baseUrl}/oauth2/authorize?client_id=${cognitoPluginOptions.clientId}&response_type=code&scope=openid&redirect_uri=${websiteUrl}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`
      );
    });
  });

  describe('getLogoutUrl tests', () => {
    it('should return the full URL of the authentication servers logout endpoint', () => {
      const url = plugin.getLogoutUrl(websiteUrl);

      expect(url).toBe(
        `${baseUrl}/logout?client_id=${cognitoPluginOptions.clientId}&logout_uri=${websiteUrl}`
      );
    });
  });

  describe('refreshAccessToken tests', () => {
    const validRefreshToken = 'validRefreshToken';
    const invalidRefreshToken = 'invalidRefreshToken';

    it('should retrieve new id and access tokens from Cognito when the refresh token is valid', async () => {
      const fakeTokens = {
        data: {
          id_token: 'id token',
          access_token: 'access token'
        }
      };
      const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce(fakeTokens);
      cognitoMock.on(DescribeUserPoolClientCommand).resolves(userPoolClientInfo);

      const tokens = await plugin.refreshAccessToken(validRefreshToken);

      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: validRefreshToken
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

    it('should throw InvalidTokenError when an invalid refresh token is passed in', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'invalid_grant' } } });

      await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(
        new InvalidTokenError('refresh token is invalid or has been revoked')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
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

    it('should throw PluginConfigurationError when the client id or secret is invalid', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'invalid_client' } } });

      await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(
        new PluginConfigurationError('invalid client id or client secret')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
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

    it('should throw PluginConfigurationError when refreshing access tokens is disabled for the app client', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { data: { error: 'unauthorized_client' } } });

      await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(
        new PluginConfigurationError('refreshing access tokens is disabled for this app client')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
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

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      const axiosSpy = jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce({ response: { status: 500, data: {} } });

      await expect(plugin.refreshAccessToken(validRefreshToken)).rejects.toThrow(
        new IdpUnavailableError('Cognito is unavailable')
      );
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: validRefreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      const axiosSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error());

      await expect(plugin.refreshAccessToken(invalidRefreshToken)).rejects.toThrow(Error);
      expect(axiosSpy).toHaveBeenCalledWith(
        `${baseUrl}/oauth2/token`,
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
  });

  describe('_getEncodedClientId tests', () => {
    it('should return a base64 encoded string representation of clientId:clientSecret', () => {
      const encodedId = plugin['_getEncodedClientId']();

      expect(encodedId).toBe(encodedClientId);
    });
  });

  describe('_getTokensExpiration tests', () => {
    it('should return a TokensExpiration object when user pool has token expiration defined', async () => {
      cognitoMock.on(DescribeUserPoolClientCommand).resolves(userPoolClientInfo);

      const tokens = await plugin['_getTokensExpirationinMS']();

      expect(tokens).toMatchObject({ idToken: 1, accessToken: 1, refreshToken: 1 });
    });

    it('should return a TokensExpiration object when user pool token expiration is undefined', async () => {
      cognitoMock.on(DescribeUserPoolClientCommand).resolves({
        UserPoolClient: {
          TokenValidityUnits: {}
        }
      });

      const tokens = await plugin['_getTokensExpirationinMS']();

      expect(tokens).toMatchObject({ idToken: 1, accessToken: 1, refreshToken: 1 });
    });

    it('should throw PluginConfigurationError when the service doesnt have correct permissions', async () => {
      cognitoMock
        .on(DescribeUserPoolClientCommand)
        .rejects(new NotAuthorizedException({ $metadata: {}, message: '' }));

      await expect(plugin['_getTokensExpirationinMS']()).rejects.toThrow(
        new PluginConfigurationError(
          'service is not authorized to perform this action. Check IAM permissions'
        )
      );
    });

    it('should throw PluginConfigurationError when the service doesnt have correct permissions', async () => {
      cognitoMock
        .on(DescribeUserPoolClientCommand)
        .rejects(new ResourceNotFoundException({ $metadata: {}, message: '' }));

      await expect(plugin['_getTokensExpirationinMS']()).rejects.toThrow(
        new PluginConfigurationError('invalid user pool id or client id')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(DescribeUserPoolClientCommand).rejects(new Error());

      await expect(plugin['_getTokensExpirationinMS']()).rejects.toThrow(Error);
    });
  });
});
