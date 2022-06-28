import { httpApiGet } from './apiHelper';

const login = async (): Promise<any> => {
  return await httpApiGet('login/?stateVerifier=TEMP_STATE_VERIFIER&codeChallenge=TEMP_CODE_CHALLENGE', {});
};

const logout = async (): Promise<any> => {
  return await httpApiGet('logout', {});
};

export { login, logout };
