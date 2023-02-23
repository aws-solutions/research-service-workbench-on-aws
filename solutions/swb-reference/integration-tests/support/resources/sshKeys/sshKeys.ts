/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import SshKey from './sshKey';

export default class SshKeys extends CollectionResource {
  public constructor(clientSession: ClientSession, parentApi: string = '') {
    super(clientSession, 'sshKeys', 'sshKey');
    const parentRoute = parentApi ? `${parentApi}/` : '';
    this._api = `${parentRoute}sshKeys`;
  }

  public sshKey(id: string): SshKey {
    return new SshKey(id, this._clientSession, this._api);
  }
}
