import { AuthenticationPlugin } from '../authenticationPlugin';

// TODO: implement
export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  public isUserLoggedIn(token: string): boolean {
    throw new Error('Method not implemented.');
  }
  public validateToken(token: string): Record<string, string | string[]>[] {
    throw new Error('Method not implemented.');
  }
  public revokeToken(token: string): void {
    throw new Error('Method not implemented.');
  }
  public getUserIdFromToken(token: string): string {
    throw new Error('Method not implemented.');
  }
  public getUserRolesFromToken(token: string): string[] {
    throw new Error('Method not implemented.');
  }
  public handleAuthorizationCode(code: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
}
