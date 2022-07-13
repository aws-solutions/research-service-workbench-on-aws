import Button from '@awsui/components-react/button';
import jwt from 'jwt-decode';
import pkceChallenge from 'pkce-challenge';
import React, { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { login, token } from '../api/auth';
import { UserItem } from '../models/User';
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
  // TODO: Fix API Lambda to store access_token and refresh_token in cookies correctly
  // Once they're stored by the auth middleware, checkIfLoggedIn will return the correct value

  useEffect(() => {
    async function getTokens(): Promise<void> {
      const code = getFragmentParam(window.location, 'code');
      const state = getFragmentParam(window.location, 'state');

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

          const decodedToken: { [id: string]: string | Array<string> } = jwt(response.idToken);
          // Assuming only one group is assigned for the user, if any
          const userGroup =
            decodedToken['cognito:groups']?.length > 0 ? decodedToken['cognito:groups'][0] : 'N/A';
          const user: UserItem = {
            id: decodedToken.sub as string,
            givenName: decodedToken.givenName as string,
            familyName: decodedToken.familyName as string,
            email: decodedToken.email as string,
            avatar: { name: 'user-profile' },
            claims: [],
            role: userGroup
          };

          // TODO: Send user to AuthenticationContext for SWB header
          // This will be used for authorization throughout the application
          // const { signIn } = useAuthentication();

          // Temporary log statement, remove when AuthZ consumes this
          console.log(user);
          localStorage.setItem('userEmail', user.email);

          localStorage.removeItem('stateVerifier');
          localStorage.removeItem('pkceVerifier');

          window.history.replaceState({}, '', window.location.origin + window.location.pathname);
          // window.location.assign(window.location.origin + window.location.pathname + 'environments');
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

  return (
    <Button className={styles.primaryButton} variant="primary" onClick={async () => await loginEvent()}>
      Login
    </Button>
  );
}

export default Login;
