/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import HostingAccountLifecycleService from '../utilities/hostingAccountLifecycleService';

export default class HostingAccountService {
  /**
   * Create hosting account record in DDB
   * @param accountMetadata - the attributes of the given hosting account
   *
   * @returns account record in DDB
   */
  public async create(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    const lifecycleService = new HostingAccountLifecycleService();

    return lifecycleService.initializeAccount(accountMetadata);
  }
}
