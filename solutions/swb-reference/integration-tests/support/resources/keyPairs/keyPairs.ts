/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import KeyPair from './keyPair';

export default class KeyPairs extends CollectionResource {
  public constructor(clientSession: ClientSession, parentApi: string = '') {
    super(clientSession, 'keyPairs', 'keyPair');
    const parentRoute = parentApi ? `${parentApi}/` : '';
    this._api = `${parentRoute}sshKeys`;
  }

  public keyPair(id: string): KeyPair {
    return new KeyPair(id, this._clientSession, this._api);
  }
}
