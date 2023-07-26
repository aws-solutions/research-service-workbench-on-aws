/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { AuthenticationPlugin } from '../../authenticationPlugin';
import { Tokens } from '../../tokens';
import { CognitoAuthenticationPluginOptions } from '../cognitoAuthenticationPlugin';

export class CognitoAuthenticationPlugin implements AuthenticationPlugin {
  public constructor(options: CognitoAuthenticationPluginOptions) {}
  public async isUserLoggedIn(accessToken: string): Promise<boolean> {
    if (accessToken) {
      return true;
    }
    return false;
  }
  public async validateToken(token: string): Promise<CognitoJwtPayload> {
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
  public async revokeToken(refreshToken: string): Promise<void> {}

  public async revokeAccessToken(accessToken: string): Promise<void> {}
  public getUserIdFromToken(decodedToken: CognitoJwtPayload): string {
    return 'id';
  }
  public getUserRolesFromToken(decodedToken: CognitoJwtPayload): string[] {
    return ['role'];
  }
  public async handleAuthorizationCode(
    code: string,
    codeVerifier: string,
    websiteUrl: string
  ): Promise<Tokens> {
    return Promise.resolve({
      idToken: {
        token: 'id token',
        expiresIn: 1234
      },
      accessToken: {
        token: 'access token',
        expiresIn: 1234
      },
      refreshToken: {
        token: 'refresh token',
        expiresIn: 1234
      }
    });
  }
  public getAuthorizationCodeUrl(state: string, codeChallenge: string, websiteUrl: string): string {
    return `https://www.fakeurl.com/authorize?client_id=fake-id&response_type=code&scope=openid&redirect_uri=${websiteUrl}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
  }
  public async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    return Promise.resolve({
      idToken: {
        token: 'id token',
        expiresIn: 1234
      },
      accessToken: {
        token: 'access token',
        expiresIn: 1234
      }
    });
  }
  public getLogoutUrl(websiteUrl: string): string {
    return `https://www.fakeurl.com/logout?client_id=fake-id&logout_uri=${websiteUrl}`;
  }
}
