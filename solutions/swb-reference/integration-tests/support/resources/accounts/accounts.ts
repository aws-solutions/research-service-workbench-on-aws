/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import Account from './account';

export default class Accounts extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'aws-accounts', 'account');
    this._api = 'aws-accounts';
  }

  public account(id: string): Account {
    return new Account(id, this._clientSession, this._api);
  }

  protected _buildDefaults(resource: AccountCreateRequest): AccountCreateRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    const awsAccountId = randomTextGenerator.getFakeText('test-Acct');
    return {
      awsAccountId: resource.awsAccountId ?? awsAccountId,
      envMgmtRoleArn: resource.envMgmtRoleArn,
      hostingAccountHandlerRoleArn: resource.hostingAccountHandlerRoleArn,
      environmentInstanceFiles: resource.environmentInstanceFiles,
      encryptionKeyArn: resource.encryptionKeyArn
    };
  }
}

interface AccountCreateRequest {
  awsAccountId: string;
  envMgmtRoleArn: string;
  hostingAccountHandlerRoleArn: string;
  environmentInstanceFiles: string;
  encryptionKeyArn: string;
}
