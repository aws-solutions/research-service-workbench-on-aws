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
   * Check to see if the user represented in the current request context is logged in.
   *
   * @param accessToken - the user's access token from the request context.
   * @returns true if the user represented in the request context is logged in.
   */
  public async isUserLoggedIn(accessToken: string): Promise<boolean> {
    return this._authenticationPlugin.isUserLoggedIn(accessToken);
  }

  /**
   * Validates the jwt token and returns the values on the token.
   *
   * @param token - an Id or Access token to be validated.
   * @returns the decoded jwt.
   *
   * @throws {@link InvalidJWTError} if the token is invalid.
   */
  public validateToken(token: string): DecodedJWT {
    return this._authenticationPlugin.validateToken(token);
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
    return this._authenticationPlugin.revokeToken(token);
  }

  /**
   * Get the Id of the user for whom the token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to extract the user Id.
   * @returns the user Id found within the token.
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's Id.
   */
  public getUserIdFromToken(decodedToken: DecodedJWT): string {
    return this._authenticationPlugin.getUserIdFromToken(decodedToken);
  }

  /**
   * Get any roles associated with a user for whom a token was issued.
   *
   * @param decodedToken - a decoded Id or access token from which to find the user's role(s)
   * @returns list of roles included in the jwt token.
   *
   * @throws {@link InvalidJWTError} if the token doesnt contain the user's roles.
   */
  public getUserRolesFromToken(decodedToken: DecodedJWT): string[] {
    return this._authenticationPlugin.getUserRolesFromToken(decodedToken);
  }

  /**
   * Take the authorization code parameter and request JWT tokens from the IdP.
   * The authorization code grant is explained [here](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/)
   *
   * @param code - an authorization code given as a query parameter in a user request
   * @returns a {@link Tokens} object containing the id, access, and refresh tokens as well as the token type and expiration.
   *
   * @throws {@link InvalidAuthorizationCodeError} if the authorization code is invalid.
   */
  public handleAuthorizationCode(code: string): Promise<Tokens> {
    return this._authenticationPlugin.handleAuthorizationCode(code);
  }

  /**
   * Returns the URL of the endpoint used to retreive the authorization code.
   *
   * @returns the endpoint URL string
   */
  public getAuthorizationCodeUrl(): string {
    return this._authenticationPlugin.getAuthorizationCodeUrl();
  }
}
