import axios from 'axios';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import jwt from 'jsonwebtoken';

import { AuthenticationPlugin } from '../authenticationPlugin';
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';

export interface CognitoAuthenticationPluginOptions {
  region: string;
  authDomain: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  private _region: string;
  private _authDomain: string;
  private _redirectUri: string;
  private _clientId: string;
  private _clientSecret: string;

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
    this._region = region;
    this._authDomain = authDomain;
    this._redirectUri = redirectUri;
    this._clientId = clientId;
    this._clientSecret = clientSecret;

    this._verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: null, // can check both access and ID tokens
      clientId
    });
  }

  // TODO must be access token
  public isUserLoggedIn(token: string): boolean {
    let loggedIn = false;

    // A get call to the IDP oauth2/userInfo endpoint will return the access token's user info if the token isn't expired, revoked, malformed, or invalid.
    axios
      .get(`https://${this._authDomain}.auth.${this._region}.amazoncognito.com/oauth2/userInfo`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        loggedIn = true;
      })
      .catch((error) => {
        console.log(error);
      });

    return loggedIn;
  }

  // TODO how do we want to signify that token is invalid? throw?
  public validateToken(token: string): Record<string, string | string[] | number | number[]>[] {
    try {
      const parts = this._verifier.verifySync(token);

      return Object.entries(parts).map(([key, value]) => ({
        [key]: value as string | string[] | number | number[]
      }));
    } catch (error) {
      return [];
    }
  }

  // TODO must be a refresh token
  public revokeToken(token: string): void {
    // encoded the clientId and secret so it can be used for authorization in a post header.
    const encodedClientId = Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64');

    // A post call to the IDP oauth2/revoke endpoint revokes the refresh token and all access tokens generated from it.
    axios
      .post(
        `https://${this._authDomain}.auth.${this._region}.amazoncognito.com/oauth2/revoke`,
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
        console.log(error);
        /* TODO handle errors
      If the token isn't present in the request or if the feature is disabled for the app client, you receive an HTTP 400 and error invalid_request.
      If the token that Amazon Cognito sent in the revocation request isn't a refresh token, you receive an HTTP 400 and error unsupported_token_type.
      If the client credentials aren't valid, you receive an HTTP 401 and error invalid_client.
      If the token has been revoked or if the client submitted a token that isn't valid, you receive an HTTP 200 OK.
      */
      });
  }

  public getUserIdFromToken(token: string): string {
    const parts = jwt.decode(token, { json: true });

    if (parts) {
      if (parts.sub) {
        return parts.sub;
      } else {
        // no sub claim
        // TODO throw?
        throw new Error();
      }
    } else {
      // invalid jwt
      // TODO throw?
      throw new Error();
    }
  }

  public getUserRolesFromToken(token: string): string[] {
    const parts = jwt.decode(token, { json: true });

    if (parts) {
      if (parts['cognito:roles']) {
        return parts['cognito:roles'];
      } else {
        // no roles claim
        // TODO throw?
        throw new Error();
      }
    } else {
      // invalid jwt
      // TODO throw?
      throw new Error();
    }
  }

  public async handleAuthorizationCode(code: string): Promise<string[]> {
    try {
      // encoded the clientId and secret so it can be used for authorization in a post header.
      const encodedClientId = Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64');

      // A post call to the IDP oauth2/token endpoint trades the code for a set of tokens.
      const response = await axios.post(
        `https://${this._authDomain}.auth.${this._region}.amazoncognito.com/oauth2/token`,
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

      const id_token = response.data.id_token;
      const access_token = response.data.access_token;
      const refresh_token = response.data.refresh_token;

      if (!id_token || !access_token || !refresh_token) {
        // TODO handle error
        throw new Error();
      }

      return [id_token, access_token, refresh_token];
    } catch (error) {
      // TODO handle error
      console.log(error);
      throw error;
    }
  }
}
