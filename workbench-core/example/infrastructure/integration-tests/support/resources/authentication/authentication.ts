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
}
