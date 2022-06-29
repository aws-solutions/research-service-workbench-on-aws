import Button from '@awsui/components-react/button';
import pkceChallenge from 'pkce-challenge';
import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { login, checkIfloggedIn, token } from '../api/auth';
import styles from '../styles/Hero.module.scss';

function getFragmentParam(location: Location, key: string): string {
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

function Login(): JSX.Element {
  const [loggedIn, setLoggedIn] = useState(false);
  // const [info, setInfo] = useState<Record<string, string> | undefined>(undefined);
  // const [guestLogin, setGuestLogin] = useState(false);
  // const [adminLogin, setAdminLogin] = useState(false);

  useEffect(() => {
    async function isUserLoggedIn(): Promise<void> {
      try {
        const isLoggedIn = await checkIfloggedIn();
        setLoggedIn(isLoggedIn.loggedIn);
      } catch (e) {
        console.log(e);
      }

      // TODO: Get user's role from Cognito group information
      // Assign admin/guest roles using useState accordingly
    }

    isUserLoggedIn().catch((e) => console.log(e));
  }, [loggedIn]);

  useEffect(() => {
    async function getTokens(): Promise<void> {
      const code = getFragmentParam(window.location, 'code');
      const state = getFragmentParam(window.location, 'state');

      if (code && state) {
        const stateVerifier = localStorage.getItem('stateVerifier');
        const codeVerifier = localStorage.getItem('pkceVerifier');

        if (state !== stateVerifier) {
          console.log('ERROR');
        }

        try {
          const response = await token({
            code,
            codeVerifier
          });

          localStorage.setItem('idToken', response.idToken);

          setLoggedIn(true);

          localStorage.removeItem('stateVerifier');
          localStorage.removeItem('pkceVerifier');

          window.history.replaceState({}, '', window.location.origin + window.location.pathname);
        } catch (e) {
          console.log(e);
        }
      }
    }

    getTokens().catch((e) => console.log(e));
  }, []);

  async function loginEvent(): Promise<void> {
    try {
      const response = await login();
      console.log(response.redirectUrl);
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

  // TODO: If logged in, route to "/environments" page

  return (
    <Button className={styles.primaryButton} variant="primary" onClick={async () => await loginEvent()}>
      Login
    </Button>
  );
}

export default Login;
