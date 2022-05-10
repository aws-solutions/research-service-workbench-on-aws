import { AuthenticationPlugin } from './authenticationPlugin';

/**
 * A AuthenticationService instance the is responsible for authenticatng authorization codes and jwt tokens.
 */
export class AuthenticationService {
  private _authenticationPlugin: AuthenticationPlugin;

  /**
   *
   * @param authenticationPlugin - A plugin that implements the {@link AuthenticationPlugin} inteface
   */
  public constructor(authenticationPlugin: AuthenticationPlugin) {
    this._authenticationPlugin = authenticationPlugin;
  }

  /**
   * Check to see if the user represented in the current request context is logged in.
   *
   * @param token - the user's Id or access token from the request context.
   * @returns true if the user represented in the request context is logged in.
   */
  public isUserLoggedIn(token: string): boolean {
    return this._authenticationPlugin.isUserLoggedIn(token);
  }

  /**
   * Validates the jwt token and returns the values on the token.
   *
   * @param token - an Id or Access token to be validated.
   * @returns An array of Key-Values which represent the token's values.
   */
  public validateToken(token: string): Record<string, string | string[] | number | number[]>[] {
    return this._authenticationPlugin.validateToken(token);
  }

  /**
   * Tell the Identity Provider to revoke the given token.
   * @param token - the token to revoke.
   */
  public revokeToken(token: string): void {
    return this._authenticationPlugin.revokeToken(token);
  }

  /**
   * Get the Id (sub) of the user for whom the token was issued.
   * This will return the "sub" as defined by the
   * [OIDC specification](https://openid.net/specs/openid-connect-core-1_0.html#Claims)
   * issued by the IdP.
   *
   * @param token - an Id or access token from which to extract the user Id.
   * @returns the `sub` claim found within the token.
   */
  public getUserIdFromToken(token: string): string {
    return this._authenticationPlugin.getUserIdFromToken(token);
  }

  /**
   * Get any roles associated with a user for whom a token was issued.
   * @param token - an Id or access token form which to find the user's role(s)
   * @returns list of roles included in the jwt token.
   */
  public getUserRolesFromToken(token: string): string[] {
    return this._authenticationPlugin.getUserRolesFromToken(token);
  }

  /**
   * Take the authorization code parameter and request JWT tokens from the IdP.
   * The authorization code grant is explained [here](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/)
   * @param code - an authorization code given as a query parameter in a user request
   * @returns ID, access and refresh tokens for the given code.
   */
  public handleAuthorizationCode(code: string): Promise<string[]> {
    return this._authenticationPlugin.handleAuthorizationCode(code);
  }
}
