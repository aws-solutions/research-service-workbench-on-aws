/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getApi } from './api';
import pkceChallenge from 'pkce-challenge';
import { useSearchParams } from 'react-router-dom';
import LoginCallback from './LoginCallback';

const styles = {
  buttonBar: {
    marginBottom: '16px',
    borderBottom: '1px solid black'
  },
  section: {
    marginBottom: '8px'
  },
  summary: {
    fontWeight: 'bold'
  }
};

const Section: React.FC<{ summary: string }> = ({ summary, children }) => (
  <details open style={styles.section}>
    <summary style={styles.summary}>{summary}</summary>
    {children}
  </details>
);

function App() {
  const [searchParams] = useSearchParams();

  const [isUserLoggedInState, setIsUserLoggedInState] = useState<string>();
  const [refreshTokenState, setRefreshTokenState] = useState<string>();
  const [logoutState, setLogoutState] = useState<string>();
  const [loginState, setLoginState] = useState<string>();

  if (searchParams.has('code') && searchParams.has('state')) return <LoginCallback />;

  const api = getApi();

  const handleIsLoggedIn = async () => {
    setIsUserLoggedInState('...');

    try {
      const {
        data: { loggedIn }
      } = await api.get('loggedIn');

      setIsUserLoggedInState(JSON.stringify(loggedIn));
    } catch (err) {
      setIsUserLoggedInState(JSON.stringify(err));
    }
  };

  const handleRefreshToken = async () => {
    setRefreshTokenState('...');

    try {
      await api.get('refresh');

      setRefreshTokenState('success');
    } catch (err) {
      setRefreshTokenState(JSON.stringify(err));
    }
  };

  const handleLogout = async () => {
    setLogoutState('...');

    try {
      await api.post('logout', {
        redirectUrl: COGNITO_CALLBACK_URL
      });

      setLogoutState('success');
    } catch (err) {
      setLogoutState(JSON.stringify(err));
    }
  };

  const handleLogin = async () => {
    setLoginState('...');
    try {
      const stateVerifier = Math.floor(Math.random() * 100001).toString(16);

      const { code_verifier, code_challenge } = pkceChallenge(128);

      localStorage.setItem('stateVerifier', stateVerifier);
      localStorage.setItem('codeVerifier', code_verifier);

      const {
        data: { signInUrl }
      } = await api.get('login', {
        params: {
          stateVerifier,
          codeChallenge: code_challenge,
          redirectUrl: COGNITO_CALLBACK_URL
        }
      });

      setLoginState('success');
      window.location.href = signInUrl;
    } catch (err) {
      setLoginState(JSON.stringify(err));
    }
  };

  return (
    <>
      <div style={styles.buttonBar}>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleIsLoggedIn}>Is logged in?</button>
        <button onClick={handleRefreshToken}>Refresh token</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <Section summary="Get Login URL state">
        <div id="login-state">{loginState}</div>
      </Section>
      <Section summary="ID token">
        <div id="id-token">{localStorage.getItem('idToken')}</div>
      </Section>

      <Section summary="Is user logged in?">
        <div id="user-logged-in-state">{isUserLoggedInState}</div>
      </Section>

      <Section summary="Refresh token state">
        <div id="refresh-token-state">{refreshTokenState}</div>
      </Section>

      <Section summary="Logout state">
        <div id="logout-state">{logoutState}</div>
      </Section>
    </>
  );
}

export default App;
