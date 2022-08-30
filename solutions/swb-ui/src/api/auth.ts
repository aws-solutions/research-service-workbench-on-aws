/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { httpApiGet, httpApiPost } from './apiHelper';

const token = async (body: { code: string; codeVerifier: string | null }): Promise<any> => {
  return await httpApiPost('token', body);
};

const login = async (): Promise<any> => {
  return await httpApiGet('login/?stateVerifier=TEMP_STATE_VERIFIER&codeChallenge=TEMP_CODE_CHALLENGE', {});
};

const logout = async (): Promise<any> => {
  return await httpApiPost('logout', {});
};

const checkIfLoggedIn = async (): Promise<any> => {
  return await httpApiGet('loggedIn', {});
};

export { login, logout, token, checkIfLoggedIn };
