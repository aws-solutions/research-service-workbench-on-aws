/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Boom from '@hapi/boom';
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

    try {
      return await lifecycleService.initializeAccount(accountMetadata);
    } catch (e) {
      Boom.badRequest(e.getErrorMessage());
      return Promise.reject(e.getErrorMessage());
    }
  }

  /**
   * Update hosting account record in DDB
   * @param accountMetadata - the attributes of the given hosting account
   *
   * @returns account record in DDB
   */
  public async update(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    const lifecycleService = new HostingAccountLifecycleService();

    try {
      return await lifecycleService.initializeAccount(accountMetadata);
    } catch (e) {
      Boom.badRequest(e.getErrorMessage());
      return Promise.reject(e.getErrorMessage());
    }
  }
}
