export interface Tokens {
  idToken: {
    token: string;
    expiresIn: number;
  };
  accessToken: {
    token: string;
    expiresIn: number;
  };
  refreshToken?: {
    token: string;
    expiresIn: number;
  };
}
