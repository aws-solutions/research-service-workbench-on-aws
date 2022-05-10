import { AuthenticationPlugin } from '../../authenticationPlugin';

export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  public isUserLoggedIn(token: string): boolean {
    if (token) {
      return true;
    }
    return false;
  }
  public validateToken(token: string): Record<string, string | string[] | number | number[]>[] {
    return [{ token }];
  }
  public revokeToken(token: string): void {}
  public getUserIdFromToken(token: string): string {
    return token;
  }
  public getUserRolesFromToken(token: string): string[] {
    return token.split('');
  }
  public handleAuthorizationCode(code: string): Promise<string[]> {
    return Promise.resolve(['id token', 'access token', 'refresh token']);
  }
}
