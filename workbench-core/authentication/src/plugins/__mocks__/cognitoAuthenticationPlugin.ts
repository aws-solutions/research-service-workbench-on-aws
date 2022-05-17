import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { AuthenticationPlugin } from '../../authenticationPlugin';
import { Tokens } from '../../tokens';
import { CognitoAuthenticationPluginOptions } from '../cognitoAuthenticationPlugin';

export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  public constructor(options: CognitoAuthenticationPluginOptions) {}
  public isUserLoggedIn(token: string): boolean {
    if (token) {
      return true;
    }
    return false;
  }
  public validateToken(token: string): CognitoJwtPayload {
    return {
      token_use: 'access',
      sub: 'sub',
      iss: 'iss',
      exp: 3600,
      iat: 123,
      auth_time: 456,
      jti: 'jti',
      origin_jti: 'origin_jti'
    };
  }
  public revokeToken(token: string): void {}
  public getUserIdFromToken(token: CognitoJwtPayload): string {
    return 'id';
  }
  public getUserRolesFromToken(token: CognitoJwtPayload): string[] {
    return ['role'];
  }
  public handleAuthorizationCode(code: string): Promise<Tokens> {
    return Promise.resolve({
      idToken: 'id token',
      accessToken: 'access token',
      refreshToken: 'refresh token',
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  }
}
