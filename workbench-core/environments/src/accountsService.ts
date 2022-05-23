/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ = require('lodash');
import { v4 as uuidv4 } from 'uuid';
import Boom from '@hapi/boom';
import { AwsService } from '@amzn/workbench-core-base';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';

interface Account {
  id: string | undefined;
  awsAccountId: string;
  hostingAccountEventBusArn: string;
  envMgmtRoleArn: string;
  error: { type: string; value: string } | undefined;
  accountHandlerRoleArn: string;
  vpcId: string;
  subnetId: string;
  cidr: string;
  environmentInstanceFiles: string;
  encryptionKeyArn: string;
  externalId?: string;
  stackName: string;
}
export default class AccountsService {
  private _aws: AwsService;
  private _stackName: string;
  public constructor() {
    this._stackName = process.env.STACK_NAME!;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: this._stackName });
  }

  /**
   * Get account from DDB
   * @param accountId - Env Id of account to retrieve
   */
  public async getAccount(accountId: string): Promise<Account> {
    const accountEntry = (await this._aws.helpers.ddb
      .get({ pk: `ACC#${accountId}`, sk: `ACC#${accountId}` })
      .execute()) as GetItemCommandOutput;

    if ('Item' in accountEntry && accountEntry.Item) {
      return accountEntry.Item! as unknown as Account;
    } else {
      throw Boom.notFound(`Could not find account ${accountId}`);
    }
  }

  public async create(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    await this._validateCreate(accountMetadata);

    const id = await this.storeToDdb(accountMetadata);

    return { id, ...accountMetadata };
  }

  public async update(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    await this._validateUpdate(accountMetadata);

    console.log(JSON.stringify(accountMetadata));

    const id = await this.storeToDdb(accountMetadata);

    return { id, ...accountMetadata };
  }

  public async _validateCreate(accountMetadata: { [key: string]: string }): Promise<void> {
    // Verify id is not provided
    if (!_.isUndefined(accountMetadata.id))
      throw new Error('Cannot specify id in request body when creating new account');

    // Verify awsAccountId is specified
    if (_.isUndefined(accountMetadata.awsAccountId))
      throw new Error('Missing AWS Account ID in request body');

    // Check if AWS account ID already exists in DDB
    const key = { key: { name: 'pk', value: `AWSACC#${accountMetadata.awsAccountId}` } };
    const ddbEntries = await this._aws.helpers.ddb.query(key).execute();
    // When trying to onboard a new account, its AWS accound ID shouldn't be present in DDB
    if (ddbEntries && ddbEntries!.Count && ddbEntries.Count > 0) {
      throw new Error(
        'This AWS Account was found in DDB. Please provide the correct id value in request body'
      );
    }
  }

  public async _validateUpdate(accountMetadata: { [key: string]: string }): Promise<void> {
    // Verify id is provided
    if (_.isUndefined(accountMetadata.id)) throw new Error('Please specify id in request body');

    // Check if AWS account ID is same as before
    if (!_.isUndefined(accountMetadata.awsAccountId)) {
      const ddbEntry = await this.getAccount(accountMetadata.id);
      if (ddbEntry.awsAccountId !== accountMetadata.awsAccountId) {
        throw new Error('The AWS Account mapped to this accountId is different than the one provided');
      }
    }
  }

  /*
   * Store hosting account information in DDB
   */
  public async storeToDdb(accountMetadata: { [key: string]: string }): Promise<string> {
    const accountKey = { pk: `ACC#${accountMetadata.id}`, sk: `ACC#${accountMetadata.id}` };
    const accountParams: { item: { [key: string]: string } } = {
      item: {
        id: accountMetadata.id || uuidv4(),
        accountId: accountMetadata.id,
        awsAccountId: accountMetadata.awsAccountId,
        envMgmtRoleArn: accountMetadata.envMgmtRoleArn,
        accountHandlerRoleArn: accountMetadata.accountHandlerRoleArn,
        eventBusArn: accountMetadata.eventBusArn,
        vpcId: accountMetadata.vpcId,
        subnetId: accountMetadata.subnetId,
        cidr: accountMetadata.cidr,
        encryptionKeyArn: accountMetadata.encryptionKeyArn,
        environmentInstanceFiles: accountMetadata.environmentInstanceFiles,
        resourceType: 'account'
      }
    };

    // We add the only optional attribute for account
    if (accountMetadata.externalId) accountParams.item.externalId = accountMetadata.externalId;

    console.log(JSON.stringify(accountMetadata));

    // Store Account row in DDB
    await this._aws.helpers.ddb.update(accountKey, accountParams).execute();

    const awsAccountKey = {
      pk: `AWSACC#${accountMetadata.awsAccountId}`,
      sk: `ACC#${accountMetadata.id}`
    };
    const awsAccountParams = {
      item: {
        id: accountMetadata.awsAccountId,
        accountId: accountMetadata.id,
        awsAccountId: accountMetadata.awsAccountId,
        resourceType: 'aws account'
      }
    };

    // Store AWS Account row in DDB (for easier duplicate checks later on)
    await this._aws.helpers.ddb.update(awsAccountKey, awsAccountParams).execute();

    return accountMetadata.id;
  }
}
