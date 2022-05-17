import axios, { AxiosError } from 'axios';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';

import { AuthenticationPlugin } from '../authenticationPlugin';
import { InvalidJWTError } from '../errors/invalidJwtError';
import { InvalidAuthorizationCodeError } from '../errors/invalidAuthorizationCodeError';
import { Tokens } from '../tokens';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { InvalidTokenTypeError } from '../errors/invalidTokenTypeError';

export interface CognitoAuthenticationPluginOptions {
  region: string;
  authDomain: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

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

  public constructor({
    region,
    authDomain,
    redirectUri,
    userPoolId,
    clientId,
    clientSecret
  }: CognitoAuthenticationPluginOptions) {
    this._redirectUri = redirectUri;
    this._clientId = clientId;
    this._clientSecret = clientSecret;

    this._oAuth2BaseUrl = `https://${authDomain}.auth.${region}.amazoncognito.com/oauth2`;
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

  public isUserLoggedIn(accessToken: string): boolean {
    let loggedIn = false;

    // A get call to the IDP oauth2/userInfo endpoint will return the access token's user info if the token isn't expired, revoked, malformed, or invalid.
    axios
      .get(`${this._oAuth2BaseUrl}/userInfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(() => {
        loggedIn = true;
      })
      .catch(() => {}); // dont need to handle errors. They all mean the user is not logged in

    return loggedIn;
  }

  public validateToken(token: string): CognitoJwtPayload {
    try {
      const parts = this._verifier.verifySync(token);

      return parts;
    } catch (error) {
      throw new InvalidJWTError('token is invalid');
    }
  }

  public revokeToken(token: string): void {
    const encodedClientId = this._getEncodedClientId();

    // A post call to the IDP oauth2/revoke endpoint revokes the refresh token and all access tokens generated from it.
    axios
      .post(
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
      )
      .catch((error) => {
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
      });
  }

  public getUserIdFromToken(decodedToken: CognitoJwtPayload): string {
    const sub = decodedToken.sub;

    if (!sub) {
      // jwt does not have a sub claim
      throw new InvalidJWTError('no sub claim');
    }
    return sub;
  }

  public getUserRolesFromToken(decodedToken: CognitoJwtPayload): string[] {
    const roles = decodedToken['cognito:groups'];
    if (!roles) {
      // jwt does not have a cognito:roles claim
      throw new InvalidJWTError('no cognito:roles claim');
    }
    return roles;
  }

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
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      throw new InvalidAuthorizationCodeError((error as AxiosError<{ error: string }>).response?.data.error);
    }
  }

  // encoded the clientId and secret so it can be used for authorization in a post header.
  private _getEncodedClientId(): string {
    return Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64');
  }
}
