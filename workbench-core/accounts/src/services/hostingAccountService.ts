/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedResponse } from '@aws/workbench-core-base';
import { TemplateResponse } from '../models/accountCfnTemplate';
import { Account } from '../models/accounts/account';
import { AwsAccountTemplateUrlsRequest } from '../models/accounts/awsAccountTemplateUrlsRequest';
import { CreateAccountRequest } from '../models/accounts/createAccountRequest';
import { GetAccountRequest } from '../models/accounts/getAccountRequest';
import { ListAccountRequest } from '../models/accounts/listAccountsRequest';
import { UpdateAccountRequest } from '../models/accounts/updateAccountRequest';
import HostingAccountLifecycleService from '../utilities/hostingAccountLifecycleService';

export default class HostingAccountService {
  private _lifecycleService: HostingAccountLifecycleService;

  public constructor(lifecycleService: HostingAccountLifecycleService) {
    this._lifecycleService = lifecycleService;
  }

  public async list(listAccountsRequest: ListAccountRequest): Promise<PaginatedResponse<Account>> {
    return await this._lifecycleService.listAccounts(listAccountsRequest);
  }

  public async get(getAccountRequest: GetAccountRequest): Promise<Account> {
    return await this._lifecycleService.getAccount(getAccountRequest, true);
  }

  public async buildTemplateUrlsForAccount(
    request: AwsAccountTemplateUrlsRequest
  ): Promise<Record<string, TemplateResponse>> {
    return await this._lifecycleService.buildTemplateUrlsForAccount(request);
  }

  /**
   * Create hosting account record in DDB
   * @param createAccountRequest - request to update Account
   *
   * @returns account record in DDB
   */
  public async create(createAccountRequest: CreateAccountRequest): Promise<Account> {
    return await this._lifecycleService.createAccount(createAccountRequest);
  }

  /**
   * Update hosting account record in DDB
   * @param updateAccountRequest - request to update account
   *
   * @returns account record in DDB
   */
  public async update(updateAccountRequest: UpdateAccountRequest): Promise<Account> {
    return await this._lifecycleService.updateAccount(updateAccountRequest);
  }
}
