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
   * Check to see if the user represented in the current request context is logged in.
   *
   * @param accessToken - the user's access token from the request context.
   * @returns true if the user represented in the request context is logged in.
   */
  isUserLoggedIn(accessToken: string): Promise<boolean>;

  /**
   * Validates the jwt token and returns the values on the token.
   *
   * @param token - an Id or Access token to be validated.
   * @returns the decoded jwt.
   *
   * @throws {@link InvalidJWTError} if the token is invalid.
   */
  validateToken(token: string): Promise<DecodedJWT>;

  /**
   * Tell the Identity Provider to revoke the given token.
   *
   * @param token - the token to revoke.
   *
   * @throws {@link InvalidTokenTypeError} if the token type provided cannot be revoked.
   * @throws {@link PluginConfigurationError} if the {@link AuthenticationPlugin} has an incorrect configuration.
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Get the Id of the user for whom the token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to extract the user Id.
   * @returns the user Id found within the token.
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's Id.
   */
  getUserIdFromToken(decodedToken: DecodedJWT): string;

  /**
   * Get any roles associated with a user for whom a token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to find the user's role(s)
   * @returns list of roles included in the jwt token.
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's roles.
   */
  getUserRolesFromToken(decodedToken: DecodedJWT): string[];

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
  handleAuthorizationCode(code: string): Promise<Tokens>;

  /**
   * Returns the URL of the endpoint used to retreive the authorization code.
   *
   * @returns the endpoint URL string
   */
  getAuthorizationCodeUrl(): string;
}
