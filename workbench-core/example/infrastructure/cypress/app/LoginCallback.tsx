/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getApi } from './api';

function LoginCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const codeVerifier = localStorage.getItem('codeVerifier');
  const stateVerifier = localStorage.getItem('stateVerifier');

  const [tokenExchangeError, setTokenExchangeError] = useState<Error>();

  useEffect(() => {
    const exchangeAuthorizationCode = async () => {
      if (!code) {
        throw new Error('Query string paramater code not found');
      }
      if (!codeVerifier) {
        throw new Error('Local storage does not contain parameter codeVerifier');
      }
      if (stateVerifier !== state) {
        throw new Error('Query string state does not match state verifier passed to login method');
      }
      const api = getApi();

      await api.post('token', {
        code,
        codeVerifier,
        redirectUrl: COGNITO_CALLBACK_URL
      });

      localStorage.removeItem('stateVerifier');
      localStorage.removeItem('codeVerifier');

      navigate('/', { replace: true });
    };

    void exchangeAuthorizationCode().catch(setTokenExchangeError);
  }, [code, state, codeVerifier, setTokenExchangeError, navigate]);

  return <div>{tokenExchangeError ? JSON.stringify(tokenExchangeError) : 'Exchanging token ...'}</div>;
}

export default LoginCallback;
