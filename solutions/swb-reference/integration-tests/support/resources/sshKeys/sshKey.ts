/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import Resource from '../base/resource';

export default class SshKey extends Resource {
  private _clientSession: ClientSession;
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'sshKey', id, parentApi);
    this._clientSession = clientSession;
  }

  protected async cleanup(): Promise<void> {
    //TODO
  }
}
