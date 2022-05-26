import axios, { AxiosError } from 'axios';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  DescribeUserPoolClientCommandInput,
  TimeUnitsType
} from '@aws-sdk/client-cognito-identity-provider';

import { AuthenticationPlugin } from '../authenticationPlugin';
import { InvalidJWTError } from '../errors/invalidJwtError';
import { InvalidAuthorizationCodeError } from '../errors/invalidAuthorizationCodeError';
import { Tokens } from '../tokens';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { InvalidTokenTypeError } from '../errors/invalidTokenTypeError';
import { InvalidCodeVerifierError } from '../errors/invalidCodeVerifierError';
import { InvalidTokenError } from '../errors/invalidTokenError';
import { getTimeInSeconds } from '../utils';

interface TokensExpiration {
  idToken: number; // in seconds
  accessToken: number; // in seconds
  refreshToken: number; // in seconds
}

export interface CognitoAuthenticationPluginOptions {
  /**
   * The user pool's region
   */
  region: string;

  /**
   * The Cognito domain. Follows the format: "https://\<domain prefix\>.auth.\<region\>.amazoncognito.com"
   */
  cognitoDomain: string;

  /**
   * The Cognito user pool ID. Follows the format: "\<region\>_\<some string\>"
   */
  userPoolId: string;

  /**
   * The Cognito app client ID.
   */
  clientId: string;

  /**
   * The Cognito app client secret
   */
  clientSecret: string;

  /**
   * The website URL to redirect back to once login in is completed on the hosted UI.
   * The URL must exist in the Cognito app client allowed callback URLs list.
   *
   * @example "https://www.exampleURL.com"
   */
  websiteUrl: string;
}

/**
 * A CognitoAuthenticationPlugin instance that interfaces with the [Cognito API](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)
 * to provide authorization code and jwt token authentication.
 */
export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  private _region: string;
  private _websiteUrl: string;
  private _userPoolId: string;
  private _clientId: string;
  private _clientSecret: string;

  private _oAuth2BaseUrl: string;
  private _verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: null;
    clientId: string;
  }>;

  /**
   *
   * @param options - a {@link CognitoAuthenticationPluginOptions} object holding the Cognito user pool information
   */
  public constructor({
    region,
    cognitoDomain,
    websiteUrl,
    userPoolId,
    clientId,
    clientSecret
  }: CognitoAuthenticationPluginOptions) {
    this._region = region;
    this._websiteUrl = websiteUrl;
    this._userPoolId = userPoolId;
    this._clientId = clientId;
    this._clientSecret = clientSecret;

    this._oAuth2BaseUrl = `${cognitoDomain}/oauth2`;
    try {
      this._verifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: null, // can check both access and ID tokens
        clientId
      });
    } catch (error) {
      throw new PluginConfigurationError(error.message);
    }
  }

  /**
   * Checks to see if the user represented in the access token is logged in.
   *
   * @param accessToken - the user's access token
   * @returns true if the user is logged in
   */
  public async isUserLoggedIn(accessToken: string): Promise<boolean> {
    try {
      // A get call to the IDP oauth2/userInfo endpoint will return the access token's user info if the token isn't expired, revoked, malformed, or invalid.
      await axios.get(`${this._oAuth2BaseUrl}/userInfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validates an id or access token and returns the values on the token.
   *
   * @param token - an Id or Access token to be validated
   * @returns the decoded jwt
   *
   * @throws {@link InvalidJWTError} if the token is invalid
   */
  public async validateToken(token: string): Promise<CognitoJwtPayload> {
    try {
      const parts = await this._verifier.verify(token);

      return parts;
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
   * @throws {@link PluginConfigurationError} if the {@link CognitoAuthenticationPlugin} has an incorrect configuration.
   */
  public async revokeToken(refreshToken: string): Promise<void> {
    const encodedClientId = this._getEncodedClientId();

    try {
      // A post call to the IDP oauth2/revoke endpoint revokes the refresh token and all access tokens generated from it.
      await axios.post(
        `${this._oAuth2BaseUrl}/revoke`,
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
      throw error;
    }
  }

  /**
   * Gets the Id of the user for whom the id or access token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to extract the user Id.
   * @returns the user Id found within the token.
   */
  public getUserIdFromToken(decodedToken: CognitoJwtPayload): string {
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
  public getUserRolesFromToken(decodedToken: CognitoJwtPayload): string[] {
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
   * @returns a {@link Tokens} object containing the id, access, and refresh tokens and their expiration (in seconds)
   *
   * @throws {@link InvalidAuthorizationCodeError} if the authorization code is invalid
   * @throws {@link PluginConfigurationError} if the {@link CognitoAuthenticationPlugin} has an incorrect configuration
   * @throws {@link InvalidCodeVerifierError} if the PCKE verifier is invalid
   */
  public async handleAuthorizationCode(code: string, codeVerifier: string): Promise<Tokens> {
    try {
      const encodedClientId = this._getEncodedClientId();

      // A post call to the IDP oauth2/token endpoint trades the code for a set of tokens.
      const response = await axios.post(
        `${this._oAuth2BaseUrl}/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this._websiteUrl,
          code_verifier: codeVerifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );

      const expiresIn = await this._getTokensExpiration();

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
      throw error;
    }
  }

  /**
   * Takes temporary state and codeChallenge values and returns the URL of the endpoint used to retreive the authorization code.
   *
   * The state and codeChallenge parameters should be temporary strings, such as TEMP_STATE and TEMP_CODE_CHALLENGE.
   * These values will be replaced on the frontend with the real values to keep them secure.
   *
   * @param state - a temporary value to represent the state parameter
   * @param codeChallenge - a temporary value to represent the code challenge parameter
   * @returns the endpoint URL string
   */
  public getAuthorizationCodeUrl(state: string, codeChallenge: string): string {
    return `${this._oAuth2BaseUrl}/authorize?client_id=${this._clientId}&response_type=code&scope=openid&redirect_uri=${this._websiteUrl}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
  }

  /**
   * Uses the refresh token to generate new access and id tokens.
   *
   * @param refreshToken - the refresh token
   * @returns a {@link Tokens} object containing the id and access tokens and their expiration (in seconds)
   *
   * @throws {@link InvalidTokenError} if the refresh token is invalid or has been revoked
   * @throws {@link PluginConfigurationError} if the {@link CognitoAuthenticationPlugin} has an incorrect configuration
   */
  public async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    try {
      const encodedClientId = this._getEncodedClientId();

      // A post call to the IDP oauth2/token endpoint uses the refresh token to get new access and id tokens.
      const response = await axios.post(
        `${this._oAuth2BaseUrl}/token`,
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

      const expiresIn = await this._getTokensExpiration();

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
      throw error;
    }
  }

  /**
   * Encodes the client id and secret so it can be used for authorization in a post header.
   *
   * @returns a string representation of the encoded client id and secret.
   */
  private _getEncodedClientId(): string {
    return Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64');
  }

  /**
   * Gets the id, access, and refresh tokens' validity length from Cognito.
   *
   * @returns a {@link TokensExpiration} object
   */
  private async _getTokensExpiration(): Promise<TokensExpiration> {
    const client = new CognitoIdentityProviderClient({ region: this._region });

    const describeInput: DescribeUserPoolClientCommandInput = {
      UserPoolId: this._userPoolId,
      ClientId: this._clientId
    };
    const describeCommand = new DescribeUserPoolClientCommand(describeInput);

    try {
      const clientInfo = await client.send(describeCommand);

      const expiresInUnits = clientInfo.UserPoolClient?.TokenValidityUnits;
      const refreshLength = clientInfo.UserPoolClient?.RefreshTokenValidity;
      const idLength = clientInfo.UserPoolClient?.IdTokenValidity;
      const accessLength = clientInfo.UserPoolClient?.AccessTokenValidity;

      return {
        idToken: getTimeInSeconds(idLength, expiresInUnits?.IdToken as TimeUnitsType),
        accessToken: getTimeInSeconds(accessLength, expiresInUnits?.AccessToken as TimeUnitsType),
        refreshToken: getTimeInSeconds(refreshLength, expiresInUnits?.RefreshToken as TimeUnitsType)
      };
    } catch (error) {
      // TODO figure out what type of errors are thrown
      throw error;
    }
  }
}
