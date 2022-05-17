/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ = require('lodash');
import { v4 as uuidv4 } from 'uuid';
import { AwsService } from '@amzn/workbench-core-base';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

export default class AccountsService {
  private _aws: AwsService;
  private _stackName: string;
  public constructor() {
    this._stackName = process.env.STACK_NAME!;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: this._stackName });
  }

  public async get(
    accountId: string,
    fields: Array<string> = []
  ): Promise<{ [key: string]: AttributeValue }> {
    // Get value from aws-accounts in DDB
    const accountEntry = await this._aws.helpers.ddb
      .get({ pk: { S: `ACC#${accountId}` }, sk: { S: `ACC#${accountId}` } })
      .execute();

    if (_.isUndefined(_.get(accountEntry, 'Item')))
      throw new Error(`Account with id ${accountId} does not exist`);
    const accountDetails = 'Item' in accountEntry ? accountEntry.Item : undefined;

    if (fields.length > 0) {
      // If specific fields are requested, we return only those
      return _.reduce(
        accountDetails,
        (result, value, key) => (_.includes(fields, key) ? _.set(result, key, value) : result),
        {}
      );
    }

    return accountDetails!;
  }

  public async create(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    await this._validateCreate(accountMetadata);

    const accountId = await this.storeToDdb(accountMetadata);

    return { accountId, ...accountMetadata };
  }

  public async update(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    await this._validateUpdate(accountMetadata);

    const accountId = await this.storeToDdb(accountMetadata);

    return { accountId, ...accountMetadata };
  }

  public async getHostEventBusArn(accountId: string): Promise<string> {
    const accountDetails = await this.get(accountId);
    return accountDetails.eventBusArn!.S!;
  }

  public async getEnvMgmtRoleArn(
    accountId: string
  ): Promise<{ envMgmtRoleArn: string; externalId?: string | undefined }> {
    const accountDetails = await this.get(accountId);
    return {
      envMgmtRoleArn: accountDetails!.envManagementRoleArn!.S!,
      externalId: accountDetails!.externalId?.S
    };
  }

  public async _validateCreate(accountMetadata: { [key: string]: string }): Promise<void> {
    // Verify id is not provided
    if (!_.isUndefined(accountMetadata.id))
      throw new Error('Cannot specify id in request body when creating new account');

    // Verify awsAccountId is specified
    if (_.isUndefined(accountMetadata.awsAccountId))
      throw new Error('Missing AWS Account ID in request body');

    // Check if AWS account ID already exists in DDB
    const key = { key: { name: 'pk', value: { S: `AWSACC#${accountMetadata.awsAccountId}` } } };
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
      const key = { pk: { S: `ACC#${accountMetadata.id}` }, sk: { S: `ACC#${accountMetadata.id}` } };
      const ddbEntry = await this._aws.helpers.ddb.get(key).execute();
      if (
        'Item' in ddbEntry &&
        ddbEntry.Item?.awsAccountId &&
        ddbEntry.Item?.awsAccountId.S !== accountMetadata.awsAccountId
      ) {
        throw new Error('The AWS Account mapped to this accountId is different than the one provided');
      }
    }
  }

  /*
   * Store hosting account information in DDB
   */
  public async storeToDdb(accountMetadata: { [key: string]: string }): Promise<string> {
    // If id is provided then we update. If not, we create
    if (_.isUndefined(accountMetadata.id)) accountMetadata.id = uuidv4();

    // Future: Only update values that were present in accountMetadata request body (with missing keys)
    const accountKey = { pk: { S: `ACC#${accountMetadata.id}` }, sk: { S: `ACC#${accountMetadata.id}` } };
    const accountParams: { item: { [key: string]: AttributeValue } } = {
      item: {
        id: { S: accountMetadata.id },
        accountId: { S: accountMetadata.id },
        awsAccountId: { S: accountMetadata.awsAccountId },
        envManagementRoleArn: { S: accountMetadata.envManagementRoleArn },
        accountHandlerRoleArn: { S: accountMetadata.accountHandlerRoleArn },
        eventBusArn: { S: accountMetadata.eventBusArn },
        vpcId: { S: accountMetadata.vpcId },
        subnetId: { S: accountMetadata.subnetId },
        cidr: { S: accountMetadata.cidr },
        encryptionKeyArn: { S: accountMetadata.encryptionKeyArn },
        environmentInstanceFiles: { S: accountMetadata.environmentInstanceFiles },
        resourceType: { S: 'account' }
      }
    };

    // We add the only optional attribute for account
    if (accountMetadata.externalId) accountParams.item.externalId = { S: accountMetadata.externalId };

    // Store Account row in DDB
    await this._aws.helpers.ddb.update(accountKey, accountParams).execute();

    const awsAccountKey = {
      pk: { S: `AWSACC#${accountMetadata.awsAccountId}` },
      sk: { S: `ACC#${accountMetadata.id}` }
    };
    const awsAccountParams = {
      item: {
        id: { S: accountMetadata.awsAccountId },
        accountId: { S: accountMetadata.id },
        awsAccountId: { S: accountMetadata.awsAccountId },
        resourceType: { S: 'aws account' }
      }
    };

    // Store AWS Account row in DDB (for easier duplicate checks later on)
    await this._aws.helpers.ddb.update(awsAccountKey, awsAccountParams).execute();

    return accountMetadata.id;
  }
}
