/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import Resource from '../base/resource';

export default class SshKey extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'sshKey', id, parentApi);
  }

  protected async cleanup(): Promise<void> {
    try {
      console.log(`Attempting to delete SSH Key ${this._id}.`);
      await this.purge();
    } catch (e) {
      console.warn(
        `Could not delete SSH Key ${this._id}". 
        Encountered error: ${e}`
      );
    }
  }
}
