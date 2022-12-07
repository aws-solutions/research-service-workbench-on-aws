/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, PaginatedResponse } from '@aws/workbench-core-base';
import { TemplateResponse } from '../models/accountCfnTemplate';
import { Account } from '../models/accounts/account';
import { ListAccountRequest } from '../models/accounts/listAccountsRequest';
import HostingAccountLifecycleService, {
  CreateAccountData,
  UpdateAccountData
} from '../utilities/hostingAccountLifecycleService';
import AccountService from './accountService';

export default class HostingAccountService {
  public async list(listAccountsRequest: ListAccountRequest): Promise<PaginatedResponse<Account>> {
    return await this._lifecycleService().listAccounts(listAccountsRequest);
  }

  public async get(accountId: string): Promise<Account> {
    return await this._lifecycleService().getAccount(accountId, true);
  }

  public async buildTemplateUrlsForAccount(externalId: string): Promise<TemplateResponse> {
    return await this._lifecycleService().buildTemplateUrlsForAccount(externalId);
  }

  /**
   * Create hosting account record in DDB
   * @param accountMetadata - the attributes of the given hosting account
   *
   * @returns account record in DDB
   */
  public async create(accountMetadata: CreateAccountData): Promise<Record<string, string>> {
    return await this._lifecycleService().createAccount(accountMetadata);
  }

  /**
   * Update hosting account record in DDB
   * @param accountMetadata - the attributes of the given hosting account
   *
   * @returns account record in DDB
   */
  public async update(accountMetadata: UpdateAccountData): Promise<Record<string, string>> {
    return await this._lifecycleService().updateAccount(accountMetadata);
  }

  private _lifecycleService(): HostingAccountLifecycleService {
    const stackName = process.env.STACK_NAME!;
    const mainAccountAwsService = new AwsService({
      region: process.env.AWS_REGION!,
      ddbTableName: stackName
    });
    const accountService = new AccountService(mainAccountAwsService.helpers.ddb);

    return new HostingAccountLifecycleService(stackName, mainAccountAwsService, accountService);
  }
}
