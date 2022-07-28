/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import jwt from 'jwt-decode';
import pkceChallenge from 'pkce-challenge';
import React, { createContext, useContext, useEffect, Context, useState, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { login, logout, token } from '../api/auth';
import { UserItem } from '../models/User';

export interface AuthenticationProps {
  user?: UserItem;
  signIn: () => void;
  signOut: () => void;
}

const AuthenticationContext: Context<AuthenticationProps> = createContext<AuthenticationProps>(
  {} as AuthenticationProps
);

export function AuthenticationProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<UserItem>();

  // TODO: Fix API Lambda to store access_token and refresh_token in cookies correctly
  // Once they're stored by the auth middleware, checkIfLoggedIn will return the correct value

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const idToken = localStorage.getItem('idToken');
      if (idToken !== undefined && idToken !== null) {
        decodeTokenAndSetUser(idToken);
      }
    }

    async function getTokens(): Promise<void> {
      const code = _getFragmentParam(window.location, 'code');
      const state = _getFragmentParam(window.location, 'state');

      if (code && state) {
        const stateVerifier = localStorage.getItem('stateVerifier');
        const codeVerifier = localStorage.getItem('pkceVerifier');

        if (state !== stateVerifier) {
          // TODO: Implement error page and apply here
          throw new Error('State verification was not successful, login denied.');
        }

        try {
          const response = await token({
            code,
            codeVerifier
          });

          localStorage.setItem('idToken', response.idToken);
          localStorage.setItem('accessToken', response.accessToken);
          decodeTokenAndSetUser(response.idToken);

          localStorage.removeItem('stateVerifier');
          localStorage.removeItem('pkceVerifier');

          window.history.replaceState({}, '', window.location.origin + window.location.pathname);
          window.location.assign(window.location.origin + window.location.pathname + 'environments');
        } catch (e) {
          console.log(e);
        }
      }
    }

    getTokens().catch((e) => console.log(e));
  }, []);

  function decodeTokenAndSetUser(idToken: string): void {
    const decodedToken: { [id: string]: string | Array<string> } = jwt(String(idToken));
    // Assuming only one group is assigned for the user, if any
    const userGroup = decodedToken['cognito:groups']?.length > 0 ? decodedToken['cognito:groups'][0] : 'N/A';
    setUser({
      id: decodedToken.sub as string,
      givenName: decodedToken.given_name as string,
      familyName: decodedToken.family_name as string,
      email: decodedToken.email as string,
      avatar: { name: 'user-profile' },
      claims: [],
      role: userGroup
    });
  }

  async function signIn(): Promise<void> {
    try {
      const response = await login();
      let signInUrl: string = response.redirectUrl;

      const challenge = pkceChallenge(128);
      localStorage.setItem('pkceVerifier', challenge.code_verifier);
      signInUrl = signInUrl.replace('TEMP_CODE_CHALLENGE', challenge.code_challenge);

      const nonceState = uuid();
      localStorage.setItem('stateVerifier', nonceState);
      signInUrl = signInUrl.replace('TEMP_STATE_VERIFIER', nonceState);
      window.location.assign(signInUrl);
    } catch (e) {
      console.log(e);
    }
  }

  async function signOut(): Promise<void> {
    try {
      const response = await logout();
      const logoutUrl = response.logoutUrl;

      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('idToken');
      window.location.assign(logoutUrl);
    } catch (e) {
      console.log(e);
    }
  }

  const memoedValue = useMemo(
    () => ({
      user,
      signIn,
      signOut
    }),
    [user]
  );

  return <AuthenticationContext.Provider value={memoedValue}>{children}</AuthenticationContext.Provider>;
}

function _getFragmentParam(location: Location, key: string): string {
  const fragmentParams = location.search;
  const keyValues: Record<string, string> = {};
  const params = fragmentParams.substring(1).split('&');
  if (params) {
    params.forEach((param) => {
      const keyValueArr = param.split('=');
      const currentKey = keyValueArr[0].replace('?', '');
      const value = keyValueArr[1];
      if (value) {
        // eslint-disable-next-line security/detect-object-injection
        keyValues[currentKey] = value;
      }
    });
  }
  // eslint-disable-next-line security/detect-object-injection
  return keyValues[key];
}

export function useAuthentication(): AuthenticationProps {
  return useContext(AuthenticationContext);
}
