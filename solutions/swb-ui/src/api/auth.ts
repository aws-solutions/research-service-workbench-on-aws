import { httpApiGet, httpApiPost } from './apiHelper';

const token = async (body: { code: string; codeVerifier: string | null }): Promise<any> => {
  return await httpApiPost('token', body);
};

const login = async (): Promise<any> => {
  return await httpApiGet('login/?stateVerifier=TEMP_STATE_VERIFIER&codeChallenge=TEMP_CODE_CHALLENGE', {});
};

const logout = async (): Promise<any> => {
  return await httpApiGet('logout', {});
};

const checkIfloggedIn = async (): Promise<any> => {
  return await httpApiGet('loggedIn', {}, true);
};

const verifyToken = async (): Promise<any> => {
  return await httpApiGet('verifyToken', {});
};

export { login, logout, token, checkIfloggedIn, verifyToken };
