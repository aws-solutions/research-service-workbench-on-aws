/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DecodedJWT } from './decodedJWT';
import { Tokens } from './tokens';

/**
 * This interface represents the token management functions of an Identity Provider (IdP).
 * This interface should be implemented for each provider used. For instance, a plugin such
 * as CognitoAuthenticationPlugin which implements this interface could be used to use
 * Cognito User Pools for token management and authenticaton.
 */
export interface AuthenticationPlugin {
  /**
   * Checks to see if the user represented in the access token is logged in.
   *
   * @param accessToken - the user's access token
   * @returns true if the user is logged in
   *
   * @throws {@link IdpUnavailableError} if the plugin's IDP is unavailable
   */
  isUserLoggedIn(accessToken: string): Promise<boolean>;

  /**
   * Validates the jwt token and returns the values on the token.
   *
   * @param token - the jwt token to be validated
   * @returns the decoded jwt
   *
   * @throws {@link InvalidJWTError} if the token is invalid
   */
  validateToken(token: string): Promise<DecodedJWT>;

  /**
   * Revokes the given token.
   *
   * @param token - the token to revoke
   *
   * @throws {@link InvalidTokenTypeError} if the token type provided cannot be revoked
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration
   * @throws {@link IdpUnavailableError} if the plugin's IDP is unavailable
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Revokes the given access token.
   *
   * @param token - the access token to revoke
   */
  revokeAccessToken(accessToken: string): Promise<void>;

  /**
   * Gets the Id of the user for whom the token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to extract the user Id
   * @returns the user Id found within the token
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's Id
   */
  getUserIdFromToken(decodedToken: DecodedJWT): string;

  /**
   * Gets any roles associated with a user for whom a token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to find the user's role(s)
   * @returns list of roles included in the jwt token
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's roles
   */
  getUserRolesFromToken(decodedToken: DecodedJWT): string[];

  /**
   * Takes the authorization code parameter and requests JWT tokens from the IdP.
   * The authorization code grant is explained [here](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/)
   *
   * @param code - an authorization code
   * @param codeVerifier - the PKCE code verifier
   * @param websiteUrl - the url to redirect to after login is completed. Must be the same url used in the {@link getAuthorizationCodeUrl} function
   * @returns a {@link Tokens} object containing the id, access, and refresh tokens and their expiration (in seconds)
   *
   * @throws {@link InvalidAuthorizationCodeError} if the authorization code is invalid
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration
   * @throws {@link InvalidCodeVerifierError} if the PCKE verifier is invalid
   * @throws {@link IdpUnavailableError} if the plugin's IDP is unavailable
   */
  handleAuthorizationCode(code: string, codeVerifier: string, websiteUrl: string): Promise<Tokens>;

  /**
   * Takes temporary state and codeChallenge values and returns the URL of the endpoint used to retrieve the authorization code.
   *
   * The state and codeChallenge parameters should be temporary strings, such as TEMP_STATE and TEMP_CODE_CHALLENGE.
   * These values will be replaced on the frontend with the real values to keep them secret.
   *
   * @param state - a temporary value to represent the state parameter
   * @param codeChallenge - a temporary value to represent the code challenge parameter
   * @param websiteUrl - the url to redirect to after login is completed
   * @returns the endpoint URL string
   */
  getAuthorizationCodeUrl(state: string, codeChallenge: string, websiteUrl: string): string;

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
  refreshAccessToken(refreshToken: string): Promise<Tokens>;

  /**
   * Gets the URL of the endpoint used to logout the user.
   *
   * @param websiteUrl - the url to redirect to after logout is completed
   * @returns the endpoint URL string
   */
  getLogoutUrl(websiteUrl: string): string;
}
