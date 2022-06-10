import axios from 'axios';
import pkceChallenge from 'pkce-challenge';
import React, { useCallback, useEffect, useState } from 'react';
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

function useAsyncEffect(effect: () => Promise<any>) {
  /* eslint-disable @typescript-eslint/no-floating-promises */
  useEffect(() => {
    (async () => {
      await effect();
    })();
  }, [effect]);
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [info, setInfo] = useState<any>();

  useAsyncEffect(
    useCallback(async () => {
      const code = getFragmentParam(window.location, 'code');
      const state = getFragmentParam(window.location, 'state');

      if (code && state) {
        if (state !== localStorage.getItem('stateVerifier')) {
          console.log('ERROR');
        }

        try {
          const loginInfo = await axios.post(
            'token',
            {
              code,
              codeVerifier: localStorage.getItem('pkceVerifier')
            },
            { withCredentials: true }
          );

          localStorage.setItem('idToken', loginInfo.data.idToken);

          const userInfo = await axios.get('pro');

          setInfo(userInfo.data.user);
          setLoggedIn(true);
        } catch (e) {
          console.log('dfgasdjhgfsadjfhksdghfs' + e);
        }
      }
    }, [])
  );

  async function login() {
    try {
      const response = await axios.get(
        'login?stateVerifier=TEMP_STATE_VERIFIER&codeVerifier=TEMP_CODE_VERIFIER'
      );
      let signInUrl: string = response.data.redirectUrl;

      const challenge = pkceChallenge(128);
      localStorage.setItem('pkceVerifier', challenge.code_verifier);
      signInUrl = signInUrl.replace('TEMP_CODE_VERIFIER', challenge.code_challenge);

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

      setLoggedIn(false);
    } catch (e) {
      console.log(e);
    }
  }

  return loggedIn ? (
    <div>
      <button onClick={logout}>Log Out</button>
      <p>{JSON.stringify(info)}</p>
    </div>
  ) : (
    <button onClick={login}>Log In</button>
  );
}

export default App;
