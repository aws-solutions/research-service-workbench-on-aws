/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import Csrf from 'csrf';
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';

export default class Authentication extends CollectionResource {
  private _csrfSecret: string;
  private _csrfToken: string;

  public constructor(clientSession: ClientSession) {
    super(clientSession, 'authentication', '');
    this._api = '';

    const csrf = new Csrf();
    this._csrfSecret = csrf.secretSync();
    this._csrfToken = csrf.create(this._csrfSecret);
  }

  public async create(body: unknown = {}, applyDefault: boolean = true): Promise<AxiosResponse> {
    throw new Error('Authentication should not be creating new resources.');
  }

  public async dummyAccessTokenRoute(accessToken?: string | number): Promise<AxiosResponse> {
    const headers: AxiosRequestHeaders = {
      Cookie: `_csrf=${this._csrfSecret};`,
      ['csrf-token']: this._csrfToken
    };

    if (accessToken) {
      headers.Cookie = headers.Cookie + `access_token=${accessToken};`;
    }

    return this._axiosInstance.get('dummyAccessTokenRoute', { headers });
  }

  public async dummyCsurfRoute(config: {
    includeCookie: boolean;
    includeToken: boolean;
    invalidCookie?: boolean;
    invalidToken?: boolean;
  }): Promise<AxiosResponse> {
    const headers: AxiosRequestHeaders = {};

    if (config.includeCookie) {
      headers.Cookie = `_csrf=${config.invalidCookie ? 'invalidSecret' : this._csrfSecret};`;
    }

    if (config.includeToken) {
      headers['csrf-token'] = config.invalidToken ? 'invalidToken' : this._csrfToken;
    }

    return this._axiosInstance.get('dummyCsurfRoute', { headers });
  }

  public async login(config: {
    stateVerifier?: string;
    codeChallenge?: string;
    origin?: string;
  }): Promise<AxiosResponse> {
    const { stateVerifier, codeChallenge, origin } = config;

    const params: Record<string, string> = {};
    const headers: AxiosRequestHeaders = {};

    if (stateVerifier) {
      params.stateVerifier = stateVerifier;
    }
    if (codeChallenge) {
      params.codeChallenge = codeChallenge;
    }
    if (origin) {
      headers.origin = origin;
    }

    return this._axiosInstance.get('login', { params, headers });
  }

  public async loggedIn(config: { access: boolean; refresh: boolean }): Promise<AxiosResponse> {
    const headers: AxiosRequestHeaders = {};
    const invalidToken = 'invalidToken';

    if (config.access) {
      headers.Cookie = `access_token=${invalidToken};`;
    }
    if (config.refresh) {
      headers.Cookie = headers.Cookie + `refresh_token=${invalidToken};`;
    }

    return this._axiosInstance.get('loggedIn', { headers });
  }

  public async refresh(config: { includeRefreshToken: boolean }): Promise<AxiosResponse> {
    const headers: AxiosRequestHeaders = {};
    const invalidToken = 'invalidToken';

    if (config.includeRefreshToken) {
      headers.Cookie = `refresh_token=${invalidToken};`;
    }

    return this._axiosInstance.get('refresh', { headers });
  }

  public async logout(config: { origin?: string }): Promise<AxiosResponse> {
    const headers: AxiosRequestHeaders = {
      Cookie: `_csrf=${this._csrfSecret};`,
      ['csrf-token']: this._csrfToken
    };

    if (config.origin) {
      headers.origin = config.origin;
    }

    return this._axiosInstance.post('logout', undefined, { headers });
  }

  public async token(config: {
    code?: string;
    codeVerifier?: string;
    origin?: string;
  }): Promise<AxiosResponse> {
    const headers: AxiosRequestHeaders = {
      Cookie: `_csrf=${this._csrfSecret};`,
      ['csrf-token']: this._csrfToken
    };

    if (config.origin) {
      headers.origin = config.origin;
    }

    const body = {
      code: config.code,
      codeVerifier: config.codeVerifier
    };

    return this._axiosInstance.post('token', body, { headers });
  }
}
