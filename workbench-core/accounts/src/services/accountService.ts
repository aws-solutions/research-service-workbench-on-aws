/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { AwsService, resourceTypeToKey, uuidWithLowercasePrefix } from '@aws/workbench-core-base';
import Boom from '@hapi/boom';
import _ from 'lodash';
import Account from '../models/account';
import { AccountCfnTemplateParameters, TemplateResponse } from '../models/accountCfnTemplate';
import CostCenter from '../models/costCenter';

export default class AccountService {
  private _aws: AwsService;

  public constructor(tableName: string) {
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: tableName });
  }

  /**
   * Get account from DDB
   * @param accountId - ID of account to retrieve
   *
   * @param includeMetadata - Controls inclusion of metadata associated with the account
   * @returns Account entry in DDB
   */
  public async getAccount(accountId: string, includeMetadata: boolean = false): Promise<Account> {
    if (includeMetadata) {
      return this._getAccountWithMetadata(accountId);
    }

    return this._getAccountWithoutMetadata(accountId);
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
      accounts = response.Items.map((item: unknown) => {
        return item as unknown as Account;
      });
    }
    return accounts;
  }

  /**
   * Create/Upload template and return its UfRL
   * @param externalAccountId - Unique ID we use to identify the hosting accout on the main account
   *
   * @returns A URL to a prepopulated template for onboarding the hosting account.
   */
  public async getTemplateURLForAccount(externalAccountId: string): Promise<TemplateResponse> {
    // Get parameters
    // Create signed URL

    const cfService = this._aws.helpers.cloudformation;
    const {
      [process.env.ACCT_HANDLER_ARN_OUTPUT_KEY!]: accountHandlerRoleArn,
      [process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!]: statusHandlerRoleArn,
      [process.env.API_HANDLER_ARN_OUTPUT_KEY!]: apiHandlerRoleArn,
      // [process.env.LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY!]: launchConstrainRole,
      [process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!]: artifactBucketArn
    } = await cfService.getCfnOutput(process.env.stackName!, [
      process.env.ACCT_HANDLER_ARN_OUTPUT_KEY!,
      process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!,
      process.env.API_HANDLER_ARN_OUTPUT_KEY!,
      // process.env.LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY!
      process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!
    ]);
    const templateParameters: AccountCfnTemplateParameters = {
      accountHandlerRole: accountHandlerRoleArn,
      apiHandlerRole: apiHandlerRoleArn,
      enableFlowLogs: 'true',
      externalId: externalAccountId,
      launchConstraintPolicyPrefix: '*', // We can do better, get from stack outputs?
      launchConstraintRolePrefix: '*', // We can do better, get from stack outputs?
      mainAccountId: process.env.MAIN_ACCT_ID!,
      namespace: process.env.STACK_NAME!,
      stackName: process.env.STACK_NAME!.concat('-hosting-account'),
      statusHandlerRole: statusHandlerRoleArn
    };

    const key = 'onboard-account.cfn.yaml'; // TODO: make this part of the post body
    const parsedBucketArn = artifactBucketArn.replace('arn:aws:s3::::', '').split('/');
    const bucket = parsedBucketArn[0];

    // Sign the url
    const s3Client = new S3Client({region : process.env.AWS_REGION!});
    const command = new GetObjectCommand( { Bucket: bucket, Key:key});
    // TODO: sign a url
    // const signedUrl = 'http://potato.com';
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 15 * 60 });

    const oj = this._orangeJuice(templateParameters, signedUrl);
    return { url: oj };
  }

  /**
   * Create hosting account record in DDB
   * @param accountMetadata - Attributes of account to create
   *
   * @returns Account entry in DDB
   */
  public async create(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    await this._validateCreate(accountMetadata);
    const id = uuidWithLowercasePrefix(resourceTypeToKey.account);

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

    return { ...accountMetadata, id };
  }

  public async _validateCreate(accountMetadata: { [key: string]: string }): Promise<void> {
    // Verify awsAccountId is specified
    if (_.isUndefined(accountMetadata.awsAccountId))
      throw Boom.badRequest('Missing AWS Account ID in request body');

    // Check if AWS account ID already exists in DDB
    const key = { key: { name: 'pk', value: `AWSACC#${accountMetadata.awsAccountId}` } };
    const ddbEntries = await this._aws.helpers.ddb.query(key).execute();
    // When trying to onboard a new account, its AWS account ID shouldn't be present in DDB
    if (ddbEntries && ddbEntries.Count && ddbEntries.Count > 0) {
      throw Boom.badRequest(
        'This AWS Account was found in DDB. Please provide the correct id value in request body'
      );
    }
  }

  public async _validateUpdate(accountMetadata: { [key: string]: string }): Promise<void> {
    // Check if AWS account ID is same as before
    if (!_.isUndefined(accountMetadata.awsAccountId)) {
      const ddbEntry = await this.getAccount(accountMetadata.id);
      if (ddbEntry.awsAccountId !== accountMetadata.awsAccountId) {
        throw Boom.badRequest('The AWS Account mapped to this accountId is different than the one provided');
      }
    }
  }

  private _orangeJuice(
    accountCfnTemplateParameters: AccountCfnTemplateParameters,
    signedUrl: string
  ): string {
    // see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-create-stacks-quick-create-links.html

    // We assume the hosting account's region is the same as where this lambda runs.
    const region = process.env.AWS_REGION;
    const {
      accountHandlerRole,
      apiHandlerRole,
      enableFlowLogs,
      externalId,
      // launchConstraintPolicyPrefix,
      // launchConstraintRolePrefix,
      mainAccountId,
      namespace,
      stackName,
      statusHandlerRole
    } = accountCfnTemplateParameters;
    const url = [
      `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/create/review/`,
      `?templateURL=${encodeURIComponent(signedUrl)}`,
      `&stackName=${stackName}`,
      `&param_Namespace=${namespace}`,
      `&param_MainAccountId=${mainAccountId}`,
      `&param_ExternalId=${externalId}`,
      `&param_AccountHandlerRoleArn=${accountHandlerRole}`,
      `&param_ApiHandlerRoleArn=${apiHandlerRole}`,
      `&param_StatusHandlerRoleArn=${statusHandlerRole}`,
      `&param_EnableFlowLogs=${enableFlowLogs || 'true'}`
    ].join('');
    return url;
  }

  /*
   * Store hosting account information in DDB
   */
  private async _storeToDdb(accountMetadata: { [key: string]: string }): Promise<string> {
    const accountKey = { pk: `ACC#${accountMetadata.id}`, sk: `ACC#${accountMetadata.id}` };
    const accountParams: { item: { [key: string]: string } } = {
      item: {
        id: accountMetadata.id,
        name: accountMetadata.name,
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
        pk: `${resourceTypeToKey.awsAccount}#${accountMetadata.awsAccountId}`,
        sk: `${resourceTypeToKey.account}#${accountMetadata.id}`
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

  private async _getAccountWithoutMetadata(accountId: string): Promise<Account> {
    const accountEntry = (await this._aws.helpers.ddb
      .get({ pk: `${resourceTypeToKey.account}#${accountId}` })
      .execute()) as GetItemCommandOutput;

    if (!accountEntry.Item) {
      throw Boom.notFound(`Could not find account ${accountId}`);
    }

    return accountEntry.Item! as unknown as Account;
  }

  private async _getAccountWithMetadata(accountId: string): Promise<Account> {
    const pk = `${resourceTypeToKey.account}#${accountId}`;

    const data = await this._aws.helpers.ddb.query({ key: { name: 'pk', value: pk } }).execute();

    if (data.Count === 0) {
      throw Boom.notFound(`Could not find account ${accountId}`);
    }

    const items = data.Items!.map((item) => {
      return item;
    });
    let account: Account = {
      awsAccountId: '',
      cidr: '',
      encryptionKeyArn: '',
      envMgmtRoleArn: '',
      environmentInstanceFiles: '',
      externalId: '',
      hostingAccountHandlerRoleArn: '',
      id: '',
      name: '',
      stackName: '',
      status: '',
      subnetId: '',
      vpcId: ''
    };
    for (const item of items) {
      // parent environment item
      const sk = item.sk as unknown as string;

      if (sk === pk) {
        account = { ...account, ...item };
        continue;
      }

      const associationPrefix = sk.split('#')[0];

      if (associationPrefix === resourceTypeToKey.costCenter) {
        account.CC = item as unknown as CostCenter;
      }
    }
    return account;
  }
}
