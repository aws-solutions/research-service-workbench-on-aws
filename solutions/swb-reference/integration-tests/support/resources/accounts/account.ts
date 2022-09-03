/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../clientSession';
import { AccountHelper } from '../../complex/accountHelper';
import Resource from '../base/resource';

export default class Account extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'aws-accounts', id, parentApi);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const { data: resource } = await defAdminSession.resources.accounts.account(this._id).get();  // TODO: This API doesn't exist, need a helper method
    const { accountId, awsAccountId } = resource;

    const accountHelper = new AccountHelper(this._setup.getMainAwsClient(), defAdminSession);
    await accountHelper.deleteDdbRecords(accountId, awsAccountId);
  }
}
