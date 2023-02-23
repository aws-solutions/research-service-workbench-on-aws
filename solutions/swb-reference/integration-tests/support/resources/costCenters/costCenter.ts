/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../clientSession';
import Resource from '../base/resource';

export default class CostCenter extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'costCenters', id, parentApi);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    await defAdminSession.resources.costCenters.costCenter(this._id).delete();
  }
}
