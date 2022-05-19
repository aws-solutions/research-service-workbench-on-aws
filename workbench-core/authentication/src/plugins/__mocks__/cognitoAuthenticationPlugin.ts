import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { AuthenticationPlugin } from '../../authenticationPlugin';
import { Tokens } from '../../tokens';
import { CognitoAuthenticationPluginOptions } from '../cognitoAuthenticationPlugin';

export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  public constructor(options: CognitoAuthenticationPluginOptions) {}
  public async isUserLoggedIn(token: string): Promise<boolean> {
    if (token) {
      return true;
    }
    return false;
  }
  public validateToken(token: string): Promise<CognitoJwtPayload> {
    return Promise.resolve({
      token_use: 'access',
      sub: 'sub',
      iss: 'iss',
      exp: 3600,
      iat: 123,
      auth_time: 456,
      jti: 'jti',
      origin_jti: 'origin_jti'
    });
  }
  public async revokeToken(token: string): Promise<void> {}
  public getUserIdFromToken(token: CognitoJwtPayload): string {
    return 'id';
  }
  public getUserRolesFromToken(token: CognitoJwtPayload): string[] {
    return ['role'];
  }
  public async handleAuthorizationCode(code: string): Promise<Tokens> {
    return Promise.resolve({
      idToken: 'id token',
      accessToken: 'access token',
      refreshToken: 'refresh token',
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  }
  public getAuthorizationCodeUrl(): string {
    return 'authorizationCodeUrl';
  }
}
