/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Account from '../models/account';
import HostingAccountLifecycleService, {
  CreateAccountMetadata,
  UpdateAccountMetadata
} from '../utilities/hostingAccountLifecycleService';
import AccountCfnTemplate from "../models/accountCfnTemplate";

export default class HostingAccountService {
  public async get(accountId: string): Promise<Account> {
    return await new HostingAccountLifecycleService().getAccount(accountId, false);
  }

  // TODO: Do I want a URL, a Url, or a string?
  public async applesauce1(accountId: string): Promise<AccountCfnTemplate> {
    // TODO: do we need to upload as well?

    const metadata = true; // TODO: Do I want, or do I not want metadata?
    return await new HostingAccountLifecycleService().applesauce2(accountId, metadata);
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
