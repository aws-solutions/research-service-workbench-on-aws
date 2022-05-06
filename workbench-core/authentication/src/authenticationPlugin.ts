/**
 * This interface represents the token management functions of an Identity Provider (IdP).
 * This interface should be implemented for each provider used. For instance, a plugin such
 * as CognitoAuthenticationPlugin which implements this interface could be used to use
 * Cognito User Pools for token management and authenticaton.
 */
export interface AuthenticationPlugin {
  /**
   * Check to see if the user represented in the current request context is logged in.
   *
   * @param token - the user's Id or access token from the request context.
   * @returns true if the user represented in the request context is logged in.
   */
  isUserLoggedIn(token: string): boolean;

  /**
   * Validates the current token by checking:
   *   - signature
   *   - expiration
   *   - audience
   *   - issuer
   *
   * and returns the values on the token.
   *
   * @param token - an Id or Access token to be validated.
   * @returns An array of Key-Values which represent the token's values.
   */
  validateToken(token: string): Record<string, string | string[]>[];

  /**
   * Tell the Identity Provider to revoke the given token.
   * @param token - the token to revoke.
   */
  revokeToken(token: string): void;

  /**
   * Get the Id (sub) of the user for whom the token was issued.
   * This will return the "sub" as defined by the
   * [OIDC specification](https://openid.net/specs/openid-connect-core-1_0.html#Claims)
   * issued by the IdP.
   *
   * @param token - an Id or access token from which to extract the user Id.
   * @returns the `sub` claim found within the token.
   */
  getUserIdFromToken(token: string): string;

  /**
   * Get any roles associated with a user for whom a token was issued.
   * @param token - an Id or access token form which to find the user's role(s)
   * @returns - any role information included on the given token.
   */
  getUserRolesFromToken(token: string): string[];

  /**
   * Take the authiorization code parameter and request JWT tokens from the IdP.
   * @param code - an authorization code given as a query parameter in a user request
   * @returns ID, access and refresh tokens for the given code.
   */
  handleAuthorizationCode(code: string): Promise<string[]>;
}
