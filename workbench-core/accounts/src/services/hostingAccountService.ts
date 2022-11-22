/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedResponse } from '@aws/workbench-core-base';
import { TemplateResponse } from '../models/accountCfnTemplate';
import { Account } from '../models/accounts/account';
import { ListAccountRequest } from '../models/accounts/listAccountsRequest';
import HostingAccountLifecycleService, {
  CreateAccountMetadata,
  UpdateAccountMetadata
} from '../utilities/hostingAccountLifecycleService';

export default class HostingAccountService {
  public async list(listAccountsRequest: ListAccountRequest): Promise<PaginatedResponse<Account>> {
    return await new HostingAccountLifecycleService().listAccounts(listAccountsRequest);
  }

  public async get(accountId: string): Promise<Account> {
    return await new HostingAccountLifecycleService().getAccount(accountId, true);
  }

  public async buildTemplateURLForAccount(awsAcctId: string, externalId: string): Promise<TemplateResponse> {
    return await new HostingAccountLifecycleService().buildTemplateURLForAccount(externalId);
  }

  /**
   * Create hosting account record in DDB
   * @param accountMetadata - the attributes of the given hosting account
   *
   * @returns account record in DDB
   */
  public async create(accountMetadata: CreateAccountMetadata): Promise<{ [key: string]: string }> {
    return await new HostingAccountLifecycleService().createAccount(accountMetadata);
  }

  /**
   * Update hosting account record in DDB
   * @param accountMetadata - the attributes of the given hosting account
   *
   * @returns account record in DDB
   */
  public async update(accountMetadata: UpdateAccountMetadata): Promise<{ [key: string]: string }> {
    return await new HostingAccountLifecycleService().updateAccount(accountMetadata);
  }
}
