/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import ClientSession from '../../clientSession';
import { AccountHelper } from '../../complex/accountHelper';
import Resource from '../base/resource';

export default class Account extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'awsAccounts', id, parentApi);
  }

  protected async cleanup(): Promise<void> {
    const accountHelper = new AccountHelper();
    const settings = this._setup.getSettings();
    const existingAccounts = await accountHelper.listOnboardedAccounts();
    const resource = _.find(existingAccounts, { awsAccountId: settings.get('awsAccountId') });

    if (resource) {
      const { id, awsAccountId } = resource;
      await accountHelper.deOnboardAccount(awsAccountId);
      await accountHelper.deleteDdbRecords(id, awsAccountId);
    }
  }
}
