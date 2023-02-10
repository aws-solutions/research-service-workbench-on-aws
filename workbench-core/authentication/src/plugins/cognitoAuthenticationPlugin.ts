/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  DescribeUserPoolClientCommandInput
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoJwtVerifierMultiUserPool } from 'aws-jwt-verify/cognito-verifier';
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import axios, { AxiosError } from 'axios';
import { AuthenticationPlugin } from '../authenticationPlugin';
import { IdpUnavailableError } from '../errors/idpUnavailableError';
import { InvalidAuthorizationCodeError } from '../errors/invalidAuthorizationCodeError';
import { InvalidCodeVerifierError } from '../errors/invalidCodeVerifierError';
import { InvalidJWTError } from '../errors/invalidJwtError';
import { InvalidTokenError } from '../errors/invalidTokenError';
import { InvalidTokenTypeError } from '../errors/invalidTokenTypeError';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { Tokens } from '../tokens';
import { getTimeInMS, TimeUnits } from '../utils';

interface TokensExpiration {
  idToken: number; // ms
  accessToken: number; // ms
  refreshToken: number; // ms
}

interface CognitoAppClient {
  /**
   * The Cognito app client IDs.
   */
  clientId: string | string[];
  /**
   * The Cognito user pool ID. Follows the format: "\<region\>_\<some string\>"
   */
  userPoolId: string;

  /**
   * The Cognito app client secret.
   */
  clientSecret: string;
}

interface WebUiAppClient extends Omit<CognitoAppClient, 'clientId'> {
  /**
   * The Cognito app client IDs.
   */
  clientId: string;
}

export interface CognitoAuthenticationPluginOptions {
  /**
   * The Cognito domain. Follows the format: "https://\<domain prefix\>.auth.\<region\>.amazoncognito.com"
   */
  cognitoDomain: string;

  /**
   * Web UI Cognito App Client information.
   */
  webUiAppClient?: WebUiAppClient;

  /**
   * Cognito App Clients information for token validation supporting ALLOW_ADMIN_USER_PASSWORD_AUTH authentication mode.
   */
  adminAppClients?: CognitoAppClient[];
}

type CognitoJwtVerifierMultiUserPoolProps = CognitoAppClient & {
  tokenUse: 'access';
};

/**
 * A CognitoAuthenticationPlugin instance that interfaces with the [Cognito API](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)
 * to provide authorization code and jwt token authentication.
 */
export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  private _webUiAppClient?: WebUiAppClient;

  private _baseUrl: string;
  private _verifier: CognitoJwtVerifierMultiUserPool<CognitoJwtVerifierMultiUserPoolProps>;
  /**
   *
   * @param options - a {@link CognitoAuthenticationPluginOptions} object holding the Cognito user pool information
   *
   * @throws {@link PluginConfigurationError} if a parameter is invalid
   */
  public constructor({
    cognitoDomain,
    webUiAppClient,
    adminAppClients = []
  }: CognitoAuthenticationPluginOptions) {
    this._webUiAppClient = webUiAppClient;
    this._baseUrl = cognitoDomain;

    const appClients = [...(webUiAppClient ? [webUiAppClient] : []), ...adminAppClients];

    if (appClients.length === 0) {
      throw new PluginConfigurationError('At least one appClient must be provided');
    }

    const regionMatch = appClients.find(
      // eslint-disable-next-line security/detect-unsafe-regex
      ({ userPoolId }) => !userPoolId.match(/^(?<region>(\w+-)?\w+-\w+-\d)+_\w+$/)
    );
    if (regionMatch) {
      throw new PluginConfigurationError(`Invalid Cognito user pool id ${regionMatch.userPoolId}`);
    }

    try {
      this._verifier = CognitoJwtVerifier.create(
        appClients.map(
          (appClient) =>
            ({
              ...appClient,
              tokenUse: 'access'
            } as CognitoJwtVerifierMultiUserPoolProps)
        )
      );
    } catch (error) {
      throw new PluginConfigurationError(error.message);
    }
  }

  /**
   * Checks to see if the user represented in the access token is logged in.
   *
   * @param accessToken - the user's access token
   * @returns true if the user is logged in
   *
   * @throws {@link IdpUnavailableError} if Cognito is unavailable
   */
  public async isUserLoggedIn(accessToken: string): Promise<boolean> {
    try {
      // A get call to the IDP oauth2/userInfo endpoint will return the access token's user info if the token isn't expired, revoked, malformed, or invalid.
      await axios.get(`${this._baseUrl}/oauth2/userInfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return true;
    } catch (error) {
      if (error.response && error.response.status > 499) {
        throw new IdpUnavailableError('Cognito is unavailable');
      }
      return false;
    }
  }

  /**
   * Validates an access token and returns the values on the token.
   *
   * @param token - an access token to be validated
   * @returns the decoded jwt
   *
   * @throws {@link InvalidJWTError} if the token is invalid
   */
  public async validateToken(token: string): Promise<CognitoAccessTokenPayload> {
    try {
      return await this._verifier.verify(token);
    } catch (error) {
      throw new InvalidJWTError('token is invalid');
    }
  }

  /**
   * Revokes a refresh token and any associated access tokens.
   *
   * @param refreshToken - the refresh token to revoke
   *
   * @throws {@link InvalidTokenTypeError} if the token passed in is not a refresh token
   * @throws {@link PluginConfigurationError} if the {@link CognitoAuthenticationPlugin} has an incorrect configuration
   * @throws {@link IdpUnavailableError} if Cognito is unavailable
   */
  public async revokeToken(refreshToken: string): Promise<void> {
    const encodedClientId = this._getEncodedClientId();

    try {
      // A post call to the IDP oauth2/revoke endpoint revokes the refresh token and all access tokens generated from it.
      await axios.post(
        `${this._baseUrl}/oauth2/revoke`,
        new URLSearchParams({
          token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );
    } catch (error) {
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_request') {
        throw new PluginConfigurationError('token revocation is disabled for this app client');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'unsupported_token_type') {
        throw new InvalidTokenTypeError('only refresh tokens may be revoked');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_client') {
        throw new PluginConfigurationError('invalid client id or client secret');
      }
      if ((error as AxiosError<{ error: string }>).response?.status && error.response.status > 499) {
        throw new IdpUnavailableError('Cognito is unavailable');
      }
      throw error;
    }
  }

  /**
   * Gets the Id of the user for whom the id or access token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to extract the user Id.
   * @returns the user Id found within the token.
   */
  public getUserIdFromToken(decodedToken: CognitoAccessTokenPayload): string {
    return decodedToken.sub;
  }

  /**
   * Gets any roles associated with a user for whom the id or access token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to find the user's role(s)
   * @returns list of roles included in the jwt token
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's roles
   */
  public getUserRolesFromToken(decodedToken: CognitoAccessTokenPayload): string[] {
    const roles = decodedToken['cognito:groups'];
    if (!roles) {
      // jwt does not have a cognito:roles claim
      throw new InvalidJWTError('no cognito:roles claim');
    }
    return roles;
  }

  /**
   * Takes an authorization code and PKCE code verifier and requests id, access, and refresh tokens from Cognito.
   *
   * @param code - the authorization code
   * @param codeVerifier - the PKCE code verifier
   * @param websiteUrl - the url to redirect to after login is completed. Must be the same url used in the {@link getAuthorizationCodeUrl} function
   * @returns a {@link Tokens} object containing the id, access, and refresh tokens and their expiration (in seconds)
   *
   * @throws {@link InvalidAuthorizationCodeError} if the authorization code is invalid
   * @throws {@link PluginConfigurationError} if the {@link CognitoAuthenticationPlugin} has an incorrect configuration
   * @throws {@link InvalidCodeVerifierError} if the PCKE verifier is invalid
   * @throws {@link IdpUnavailableError} if Cognito is unavailable
   */
  public async handleAuthorizationCode(
    code: string,
    codeVerifier: string,
    websiteUrl: string
  ): Promise<Tokens> {
    try {
      const encodedClientId = this._getEncodedClientId();

      // A post call to the IDP oauth2/token endpoint trades the code for a set of tokens.
      const response = await axios.post(
        `${this._baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: websiteUrl,
          code_verifier: codeVerifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );

      const expiresIn = await this._getTokensExpirationinMS();

      return {
        idToken: {
          token: response.data.id_token,
          expiresIn: expiresIn.idToken
        },
        accessToken: {
          token: response.data.access_token,
          expiresIn: expiresIn.accessToken
        },
        refreshToken: {
          token: response.data.refresh_token,
          expiresIn: expiresIn.refreshToken
        }
      };
    } catch (error) {
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_client') {
        throw new PluginConfigurationError('invalid client id or client secret');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_grant') {
        throw new InvalidAuthorizationCodeError('authorization code has been used already or is invalid');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'unauthorized_client') {
        throw new PluginConfigurationError('authorization code grant is disabled for this app client');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_request') {
        throw new InvalidCodeVerifierError('pkce code verifier is invalid');
      }
      if (error.response && error.response.status > 499) {
        throw new IdpUnavailableError('Cognito is unavailable');
      }
      throw error;
    }
  }

  /**
   * Takes temporary state and codeChallenge values and returns the URL of the endpoint used to retrieve the authorization code.
   *
   * The state and codeChallenge parameters should be temporary strings, such as TEMP_STATE and TEMP_CODE_CHALLENGE.
   * These values will be replaced on the frontend with the real values to keep them secure.
   *
   * @param state - a temporary value to represent the state parameter
   * @param codeChallenge - a temporary value to represent the code challenge parameter
   * @param websiteUrl - the url to redirect to after login is completed
   * @returns the endpoint URL string
   */
  public getAuthorizationCodeUrl(state: string, codeChallenge: string, websiteUrl: string): string {
    if (!this._webUiAppClient) {
      throw new PluginConfigurationError('WebUI client not configured');
    }
    return `${this._baseUrl}/oauth2/authorize?client_id=${this._webUiAppClient.clientId}&response_type=code&scope=openid&redirect_uri=${websiteUrl}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
  }

  /**
   * Uses the refresh token to generate new access and id tokens.
   *
   * @param refreshToken - the refresh token
   * @returns a {@link Tokens} object containing the id and access tokens and their expiration (in seconds)
   *
   * @throws {@link InvalidTokenError} if the refresh token is invalid or has been revoked
   * @throws {@link PluginConfigurationError} if the {@link CognitoAuthenticationPlugin} has an incorrect configuration
   * @throws {@link IdpUnavailableError} if Cognito is unavailable
   */
  public async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    try {
      const encodedClientId = this._getEncodedClientId();

      // A post call to the IDP oauth2/token endpoint uses the refresh token to get new access and id tokens.
      const response = await axios.post(
        `${this._baseUrl}/oauth2/token`,
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

      const expiresIn = await this._getTokensExpirationinMS();

      return {
        idToken: {
          token: response.data.id_token,
          expiresIn: expiresIn.idToken
        },
        accessToken: {
          token: response.data.access_token,
          expiresIn: expiresIn.accessToken
        }
      };
    } catch (error) {
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_client') {
        throw new PluginConfigurationError('invalid client id or client secret');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_grant') {
        throw new InvalidTokenError('refresh token is invalid or has been revoked');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'unauthorized_client') {
        throw new PluginConfigurationError('refreshing access tokens is disabled for this app client');
      }
      if (error.response && error.response.status > 499) {
        throw new IdpUnavailableError('Cognito is unavailable');
      }
      throw error;
    }
  }

  /**
   * Gets the URL of the endpoint used to logout the user.
   *
   * @param websiteUrl - the url to redirect to after logout is completed
   * @returns the endpoint URL string
   */
  public getLogoutUrl(websiteUrl: string): string {
    if (!this._webUiAppClient) {
      throw new PluginConfigurationError('WebUI client not configured');
    }

    return `${this._baseUrl}/logout?client_id=${this._webUiAppClient.clientId}&logout_uri=${websiteUrl}`;
  }

  /**
   * Encodes the client id and secret so it can be used for authorization in a post header.
   *
   * @returns a string representation of the encoded client id and secret.
   */
  private _getEncodedClientId(): string {
    if (!this._webUiAppClient) {
      throw new PluginConfigurationError('WebUI client not configured');
    }

    return Buffer.from(`${this._webUiAppClient.clientId}:${this._webUiAppClient.clientSecret}`).toString(
      'base64'
    );
  }

  /**
   * Gets the id, access, and refresh tokens' validity length from Cognito.
   *
   * @returns a {@link TokensExpiration} object
   */
  private async _getTokensExpirationinMS(): Promise<TokensExpiration> {
    if (!this._webUiAppClient) {
      throw new PluginConfigurationError('WebUI client not configured');
    }

    const { userPoolId, clientId } = this._webUiAppClient;

    // eslint-disable-next-line security/detect-unsafe-regex
    const regionMatch = userPoolId.match(/^(?<region>(\w+-)?\w+-\w+-\d)+_\w+$/);
    const client = new CognitoIdentityProviderClient({ region: regionMatch!.groups!.region });

    const describeInput: DescribeUserPoolClientCommandInput = {
      UserPoolId: userPoolId,
      ClientId: clientId
    };
    const describeCommand = new DescribeUserPoolClientCommand(describeInput);

    try {
      const { UserPoolClient } = await client.send(describeCommand);

      const idTokenTime = UserPoolClient!.IdTokenValidity ?? 60;
      const accessTokenTime = UserPoolClient!.AccessTokenValidity ?? 60;
      const refreshTokenTime = UserPoolClient!.RefreshTokenValidity ?? 30;

      const idTokenUnits = UserPoolClient!.TokenValidityUnits!.IdToken ?? TimeUnits.MINUTES;
      const accessTokenUnits = UserPoolClient!.TokenValidityUnits!.AccessToken ?? TimeUnits.MINUTES;
      const refreshTokenUnits = UserPoolClient!.TokenValidityUnits!.RefreshToken ?? TimeUnits.DAYS;

      return {
        idToken: getTimeInMS(idTokenTime, idTokenUnits as TimeUnits),
        accessToken: getTimeInMS(accessTokenTime, accessTokenUnits as TimeUnits),
        refreshToken: getTimeInMS(refreshTokenTime, refreshTokenUnits as TimeUnits)
      };
    } catch (error) {
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError(
          'service is not authorized to perform this action. Check IAM permissions'
        );
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('invalid user pool id or client id');
      }
      throw error;
    }
  }
}
