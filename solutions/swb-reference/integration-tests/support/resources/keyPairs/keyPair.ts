/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
// import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Resource from '../base/resource';

export default class KeyPair extends Resource {
  private _clientSession: ClientSession;

  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'keyPair', id, parentApi);
    this._clientSession = clientSession;
  }

  protected async cleanup(): Promise<void> {
    // TODO
    try {
      console.log(`Attempting to delete key pair ${this._id}.`);
      await this.delete();
    } catch (e) {
      console.warn(
        `Could not delete key pair ${this._id}". 
        Encountered error: ${e}`
      );
    }
  }
}
