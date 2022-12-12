/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import Account from './account';

export default class Accounts extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'aws-accounts', 'account');
    this._api = 'awsAccounts';
  }

  public account(id: string): Account {
    return new Account(id, this._clientSession, this._api);
  }

  public async getHostingAccountTemplate(externalId: string): Promise<AxiosResponse> {
    return await this._axiosInstance.post('/awsAccountTemplateUrls', { externalId });
  }

  protected _buildDefaults(resource: AccountCreateRequest): AccountCreateRequest {
    return {
      awsAccountId: 'sampleAccountId',
      envMgmtRoleArn: resource.envMgmtRoleArn,
      hostingAccountHandlerRoleArn: resource.hostingAccountHandlerRoleArn,
      name: resource.name,
      externalId: resource.externalId
    };
  }
}

interface AccountCreateRequest {
  awsAccountId: string;
  envMgmtRoleArn: string;
  hostingAccountHandlerRoleArn: string;
  name: string;
  externalId: string;
}
