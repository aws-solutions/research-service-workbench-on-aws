/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticationPlugin } from '../authenticationPlugin';
import { DecodedJWT } from '../decodedJWT';
import { Tokens } from '../tokens';

export const tokens = {
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
} as const;

export class AuthenticationService {
  public constructor(authenticationPlugin: AuthenticationPlugin) {}

  public async isUserLoggedIn(accessToken: string): Promise<boolean> {
    if (accessToken === 'validToken') {
      return true;
    }
    return false;
  }

  public async validateToken(token: string): Promise<DecodedJWT> {
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (token === 'validToken') {
      return {};
    }
    throw new Error();
  }

  public async revokeToken(token: string): Promise<void> {
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (token === 'validToken') {
      return;
    }
    throw new Error();
  }

  public async revokeAccessToken(token: string): Promise<void> {
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (token === 'validToken') {
      return;
    }
    throw new Error();
  }

  public getUserIdFromToken(decodedToken: DecodedJWT): string {
    return 'id';
  }

  public getUserRolesFromToken(decodedToken: DecodedJWT): string[] {
    return ['role'];
  }

  public async handleAuthorizationCode(
    code: string,
    codeVerifier: string,
    websiteUrl: string
  ): Promise<Tokens> {
    if (code === 'validCode' && codeVerifier === 'validCodeVerifier') {
      return tokens;
    }
    throw new Error();
  }

  public getAuthorizationCodeUrl(state: string, codeChallenge: string, websiteUrl: string): string {
    return `https://www.fakeurl.com/authorize?client_id=fake-id&response_type=code&scope=openid&redirect_uri=${websiteUrl}&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
  }

  public async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    if (refreshToken === 'validToken') {
      return tokens;
    }
    throw new Error();
  }

  public getLogoutUrl(websiteUrl: string): string {
    return `https://www.fakeurl.com/logout?client_id=fake-id&logout_uri=${websiteUrl}`;
  }
}
