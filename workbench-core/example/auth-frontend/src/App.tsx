import axios from 'axios';
import pkceChallenge from 'pkce-challenge';
import React, { useEffect, useState } from 'react';
import './App.css';
import { v4 as uuid } from 'uuid';

function getFragmentParam(location: Location, key: string) {
  const fragmentParams = location.search;
  const keyValues: Record<string, string> = {};
  const params = fragmentParams.substring(1).split('&');
  if (params) {
    params.forEach((param) => {
      const keyValueArr = param.split('=');
      const currentKey = keyValueArr[0].replace('?', '');
      const value = keyValueArr[1];
      if (value) {
        keyValues[currentKey] = value;
      }
    });
  }
  return keyValues[key];
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [info, setInfo] = useState<any>(undefined);
  const [guestLogin, setGuestLogin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);

  useEffect(() => {
    async function getTokens() {
      const code = getFragmentParam(window.location, 'code');
      const state = getFragmentParam(window.location, 'state');

      if (code && state) {
        const stateVerifier = localStorage.getItem('stateVerifier');
        const codeVerifier = localStorage.getItem('pkceVerifier');

        if (state !== stateVerifier) {
          console.log('ERROR');
        }

        try {
          const loginInfo = await axios.post(
            'token',
            {
              code,
              codeVerifier
            },
            { withCredentials: true }
          );

          localStorage.setItem('idToken', loginInfo.data.idToken);

          setLoggedIn(true);

          localStorage.removeItem('stateVerifier');
          localStorage.removeItem('pkceVerifier');

          window.history.replaceState({}, '', window.location.origin + window.location.pathname);
        } catch (e) {
          console.log(e);
        }

        try {
          const userInfo = await axios.get('pro');
          setInfo(userInfo.data.user);
        } catch (e) {
          console.log(e);
        }

        try {
          await axios.get('guest');
          setGuestLogin(true);
        } catch (e) {
          console.log(e);
        }

        try {
          await axios.get('admin');
          setAdminLogin(true);
        } catch (e) {
          console.log(e);
        }
      }
    }

    getTokens().catch((e) => console.log(e));
  }, []);

  async function login() {
    try {
      const response = await axios.get(
        'login?stateVerifier=TEMP_STATE_VERIFIER&codeChallenge=TEMP_CODE_CHALLENGE'
      );
      let signInUrl: string = response.data.redirectUrl;

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

  async function logout() {
    try {
      await axios.get('logout');
      // TODO replace with call to auth middleware
      window.location.assign(
        '<Cognito Hosted UI Domain>/logout?client_id=<Cognito User Pool Client ID>&logout_uri=http://localhost:3000'
      );

      setLoggedIn(false);
      setInfo(undefined);
      setGuestLogin(false);
      setAdminLogin(false);
      window.localStorage.removeItem('idToken');
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      <button onClick={loggedIn ? logout : login}>{loggedIn ? 'Log Out' : 'Log In'}</button>
      <div>
        <p>{info ? `User Info: ${JSON.stringify(info)}` : 'You are not logged in'}</p>
        <p>You{guestLogin ? ' ' : ' dont not '}have guest access</p>
        <p>You{adminLogin ? ' ' : ' dont not '}have admin access</p>
      </div>
    </div>
  );
}

export default App;
