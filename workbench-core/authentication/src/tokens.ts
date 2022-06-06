export interface Tokens {
  idToken: {
    token: string;
    expiresIn?: number; // seconds
  };
  accessToken: {
    token: string;
    expiresIn?: number; // seconds
  };
  refreshToken?: {
    token: string;
    expiresIn?: number; // seconds
  };
}
