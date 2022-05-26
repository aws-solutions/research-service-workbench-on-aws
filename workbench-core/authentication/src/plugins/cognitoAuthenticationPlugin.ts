import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import axios, { AxiosError } from 'axios';
import { AuthenticationPlugin } from '../authenticationPlugin';
import { InvalidAuthorizationCodeError } from '../errors/invalidAuthorizationCodeError';
import { InvalidJWTError } from '../errors/invalidJwtError';
import { InvalidTokenTypeError } from '../errors/invalidTokenTypeError';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { Tokens } from '../tokens';

export interface CognitoAuthenticationPluginOptions {
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
   * The Cognito app client allowed callback URL
   */
  redirectUri: string;
}

/**
 * A CognitoAuthenticationPlugin instance that interfaces with the [Cognito API](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)
 * to provide authorization code and jwt token authentication.
 */
export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  private _redirectUri: string;
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
   * @param options - a {@link CognitoAuthenticationPluginOptions} object holding the Cognito user pool information.
   */
  public constructor({
    cognitoDomain,
    redirectUri,
    userPoolId,
    clientId,
    clientSecret
  }: CognitoAuthenticationPluginOptions) {
    this._redirectUri = redirectUri;
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

    // this._verifier.hydrate().catch(e => { throw e }); TODO necessary?
  }

  /**
   * Check to see if the user represented in the current request context is logged in.
   *
   * @param accessToken - the user's access token from the request context.
   * @returns true if the user represented in the request context is logged in.
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
   * Validates the jwt token and returns the values on the token.
   *
   * @param token - an Id or Access token to be validated.
   * @returns the decoded jwt.
   *
   * @throws {@link InvalidJWTError} if the token is invalid.
   */
  public validateToken(token: string): CognitoJwtPayload {
    try {
      const parts = this._verifier.verifySync(token);

      return parts;
    } catch (error) {
      throw new InvalidJWTError('token is invalid');
    }
  }

  /**
   * Tell the Identity Provider to revoke the given token.
   *
   * @param token - the token to revoke.
   *
   * @throws {@link InvalidTokenTypeError} if the token type provided cannot be revoked.
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration.
   */
  public async revokeToken(token: string): Promise<void> {
    const encodedClientId = this._getEncodedClientId();

    try {
      // A post call to the IDP oauth2/revoke endpoint revokes the refresh token and all access tokens generated from it.
      await axios.post(
        `${this._oAuth2BaseUrl}/revoke`,
        new URLSearchParams({
          token: token
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
        throw new InvalidTokenTypeError('only access tokens may be revoked');
      }
      if ((error as AxiosError<{ error: string }>).response?.data.error === 'invalid_client') {
        throw new PluginConfigurationError('invalid client id or client secret');
      }
      throw error;
    }
  }

  /**
   * Get the Id of the user for whom the token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to extract the user Id.
   * @returns the user Id found within the token.
   */
  public getUserIdFromToken(decodedToken: CognitoJwtPayload): string {
    return decodedToken.sub;
  }

  /**
   * Get any roles associated with a user for whom a token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to find the user's role(s)
   * @returns list of roles included in the jwt token.
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's roles.
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
   * Take the authorization code parameter and request JWT tokens from the IdP.
   * The authorization code grant is explained [here](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/)
   *
   * @param code - an authorization code given as a query parameter in a user request
   * @returns a {@link Tokens} object containing the id, access, and refresh tokens as well as the token type and expiration.
   *
   * @throws {@link InvalidAuthorizationCodeError} if the authorization code is invalid.
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration.
   */
  public async handleAuthorizationCode(code: string): Promise<Tokens> {
    try {
      const encodedClientId = this._getEncodedClientId();

      // A post call to the IDP oauth2/token endpoint trades the code for a set of tokens.
      const response = await axios.post(
        `${this._oAuth2BaseUrl}/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: this._clientId,
          redirect_uri: this._redirectUri
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedClientId}`
          }
        }
      );

      return {
        idToken: response.data.id_token,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
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
}
