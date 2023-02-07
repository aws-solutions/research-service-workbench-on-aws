/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';

export default class KeyPairs extends CollectionResource {
  public constructor(clientSession: ClientSession, parentApi: string = '') {
    super(clientSession, 'keyPairs', 'keyPair');
    const parentRoute = parentApi ? `${parentApi}/` : '';
    this._api = `${parentRoute}sshKeys`;
  }

  public async delete(): Promise<void> {
    await this._axiosInstance.delete(this._api);
  }

  public async keyPair(): Promise<AxiosResponse> {
    return this._axiosInstance.get(this._api);
  }
}
