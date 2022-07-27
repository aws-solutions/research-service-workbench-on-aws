/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import environmentResourceTypeToKey from '../constants/environmentResourceTypeToKey';
import { HostingAccountStatus } from '../constants/hostingAccountStatus';

interface Account {
  id: string | undefined;
  awsAccountId: string;
  envMgmtRoleArn: string;
  error: { type: string; value: string } | undefined;
  hostingAccountHandlerRoleArn: string;
  vpcId: string;
  subnetId: string;
  cidr: string;
  environmentInstanceFiles: string;
  encryptionKeyArn: string;
  externalId?: string;
  stackName: string;
  status: HostingAccountStatus;
}
export default class AccountService {
  private _aws: AwsService;

  public constructor(tableName: string) {
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: tableName });
  }

  /**
   * Get account from DDB
   * @param accountId - ID of account to retrieve
   *
   * @returns Account entry in DDB
   */
  public async getAccount(accountId: string): Promise<Account> {
    const accountEntry = (await this._aws.helpers.ddb
      .get({
        pk: `${environmentResourceTypeToKey.account}#${accountId}`,
        sk: `${environmentResourceTypeToKey.account}#${accountId}`
      })
      .execute()) as GetItemCommandOutput;

    if (accountEntry.Item) {
      return accountEntry.Item! as unknown as Account;
    } else {
      throw Boom.notFound(`Could not find account ${accountId}`);
    }
  }

  /**
   * Create or update hosting account record in DDB
   * @param accountMetadata - Attributes of account to create/update
   *
   * @returns Account entry in DDB
   */
  public async createOrUpdate(accountMetadata: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    if (_.isUndefined(accountMetadata.id)) return this.create(accountMetadata);

    return this.update(accountMetadata);
  }

  /**
   * Get all account entries from DDB
   *
   * @returns Account entries in DDB
   */
  public async getAccounts(): Promise<Account[]> {
    const queryParams = {
      index: 'getResourceByCreatedAt',
      key: { name: 'resourceType', value: 'account' }
    };
    const response = await this._aws.helpers.ddb.query(queryParams).execute();
    let accounts: Account[] = [];
    if (response && response.Items) {
      accounts = response.Items.map((item) => {
        return item as unknown as Account;
      });
    }
    return accounts;
  }

  /**
   * Create hosting account record in DDB
   * @param accountMetadata - Attributes of account to create
   *
   * @returns Account entry in DDB
   */
  public async create(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    await this._validateCreate(accountMetadata);
    const id = uuidv4();

    await this._storeToDdb({ id, ...accountMetadata });

    return { id, ...accountMetadata };
  }

  /**
   * Update hosting account record in DDB
   * @param accountMetadata - Attributes of account to update
   *
   * @returns Account entry in DDB
   */
  public async update(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    await this._validateUpdate(accountMetadata);

    const id = await this._storeToDdb(accountMetadata);

    return { id, ...accountMetadata };
  }

  public async _validateCreate(accountMetadata: { [key: string]: string }): Promise<void> {
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
  private async _storeToDdb(accountMetadata: { [key: string]: string }): Promise<string> {
    const accountKey = { pk: `ACC#${accountMetadata.id}`, sk: `ACC#${accountMetadata.id}` };
    const accountParams: { item: { [key: string]: string } } = {
      item: {
        id: accountMetadata.id,
        awsAccountId: accountMetadata.awsAccountId,
        envMgmtRoleArn: accountMetadata.envMgmtRoleArn,
        hostingAccountHandlerRoleArn: accountMetadata.hostingAccountHandlerRoleArn,
        vpcId: accountMetadata.vpcId,
        subnetId: accountMetadata.subnetId,
        encryptionKeyArn: accountMetadata.encryptionKeyArn,
        environmentInstanceFiles: accountMetadata.environmentInstanceFiles,
        stackName: `${process.env.STACK_NAME!}-hosting-account`,
        status: accountMetadata.status,
        resourceType: 'account'
      }
    };

    // We add the only optional attribute for account
    if (accountMetadata.externalId) accountParams.item.externalId = accountMetadata.externalId;

    // Store Account row in DDB
    await this._aws.helpers.ddb.update(accountKey, accountParams).execute();

    if (accountMetadata.awsAccountId) {
      const awsAccountKey = {
        pk: `${environmentResourceTypeToKey.awsAccount}#${accountMetadata.awsAccountId}`,
        sk: `${environmentResourceTypeToKey.account}#${accountMetadata.id}`
      };
      const awsAccountParams = {
        item: {
          id: accountMetadata.awsAccountId,
          accountId: accountMetadata.id,
          awsAccountId: accountMetadata.awsAccountId,
          resourceType: 'awsAccount'
        }
      };

      // Store AWS Account row in DDB (for easier duplicate checks later on)
      await this._aws.helpers.ddb.update(awsAccountKey, awsAccountParams).execute();
    }

    return accountMetadata.id;
  }
}
