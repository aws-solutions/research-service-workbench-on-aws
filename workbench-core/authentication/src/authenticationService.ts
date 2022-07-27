/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticationPlugin } from './authenticationPlugin';
import { DecodedJWT } from './decodedJWT';
import { Tokens } from './tokens';

/**
 * An AuthenticationService instance that is responsible for authenticatng authorization codes and jwt tokens.
 */
export class AuthenticationService {
  private _authenticationPlugin: AuthenticationPlugin;

  /**
   *
   * @param authenticationPlugin - A plugin that implements the {@link AuthenticationPlugin} interface
   */
  public constructor(authenticationPlugin: AuthenticationPlugin) {
    this._authenticationPlugin = authenticationPlugin;
  }

  /**
   * Checks to see if the user represented in the access token is logged in.
   *
   * @param accessToken - the user's access token
   * @returns true if the user is logged in
   *
   * @throws {@link IdpUnavailableError} if the plugin's IDP is unavailable
   */
  public async isUserLoggedIn(accessToken: string): Promise<boolean> {
    return this._authenticationPlugin.isUserLoggedIn(accessToken);
  }

  /**
   * Validates the jwt token and returns the values on the token.
   *
   * @param token - the jwt token to be validated
   * @returns the decoded jwt
   *
   * @throws {@link InvalidJWTError} if the token is invalid
   */
  public async validateToken(token: string): Promise<DecodedJWT> {
    return this._authenticationPlugin.validateToken(token);
  }

  /**
   * Revokes the given token.
   *
   * @param token - the token to revoke
   *
   * @throws {@link InvalidTokenTypeError} if the token type provided cannot be revoked
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration
   * @throws {@link IdpUnavailableError} if the plugin's IDP is unavailable
   */
  public async revokeToken(token: string): Promise<void> {
    await this._authenticationPlugin.revokeToken(token);
  }

  /**
   * Gets the Id of the user for whom the token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to extract the user Id
   * @returns the user Id found within the token
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's Id
   */
  public getUserIdFromToken(decodedToken: DecodedJWT): string {
    return this._authenticationPlugin.getUserIdFromToken(decodedToken);
  }

  /**
   * Gets any roles associated with a user for whom a token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to find the user's role(s)
   * @returns list of roles included in the jwt token
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's roles
   */
  public getUserRolesFromToken(decodedToken: DecodedJWT): string[] {
    return this._authenticationPlugin.getUserRolesFromToken(decodedToken);
  }

  /**
   * Takes the authorization code parameter and requests JWT tokens from the IdP.
   * The authorization code grant is explained [here](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/)
   *
   * @param code - an authorization code
   * @param codeVerifier - the PKCE code verifier
   * @returns a {@link Tokens} object containing the id, access, and refresh tokens and their expiration (in seconds)
   *
   * @throws {@link InvalidAuthorizationCodeError} if the authorization code is invalid
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration
   * @throws {@link InvalidCodeVerifierError} if the PCKE verifier is invalid
   * @throws {@link IdpUnavailableError} if the plugin's IDP is unavailable
   */
  public async handleAuthorizationCode(code: string, codeVerifier: string): Promise<Tokens> {
    return this._authenticationPlugin.handleAuthorizationCode(code, codeVerifier);
  }

  /**
   * Takes temporary state and codeChallenge values and returns the URL of the endpoint used to retrieve the authorization code.
   *
   * The state and codeChallenge parameters should be temporary strings, such as TEMP_STATE and TEMP_CODE_CHALLENGE.
   * These values will be replaced on the frontend with the real values to keep them secret.
   *
   * @param state - a temporary value to represent the state parameter
   * @param codeChallenge - a temporary value to represent the code challenge parameter
   * @returns the endpoint URL string
   */
  public getAuthorizationCodeUrl(state: string, codeChallenge: string): string {
    return this._authenticationPlugin.getAuthorizationCodeUrl(state, codeChallenge);
  }

  /**
   * Uses the refresh token to generate new jwt tokens.
   *
   * @param refreshToken - the refresh token
   * @returns a {@link Tokens} object containing the refreshed tokens and their expiration (in seconds)
   *
   * @throws {@link InvalidTokenError} if the refresh token is invalid
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration
   * @throws {@link IdpUnavailableError} if the plugin's IDP is unavailable
   */
  public async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    return this._authenticationPlugin.refreshAccessToken(refreshToken);
  }

  /**
   * Gets the URL of the endpoint used to logout the user.
   *
   * @returns the endpoint URL string
   */
  public getLogoutUrl(): string {
    return this._authenticationPlugin.getLogoutUrl();
  }

  /**
   * Gets the URL of the endpoint used to logout the user.
   *
   * @returns the endpoint URL string
   */
  public getLogoutUrl(): string {
    return this._authenticationPlugin.getLogoutUrl();
  }
}
