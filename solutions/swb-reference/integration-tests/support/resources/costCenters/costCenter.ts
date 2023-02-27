/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../clientSession';
import { DEFLAKE_DELAY_IN_MILLISECONDS } from '../../utils/constants';
import { sleep } from '../../utils/utilities';
import Resource from '../base/resource';

export default class CostCenter extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'costCenters', id, parentApi);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when terminating multiple cost centers
    await defAdminSession.resources.costCenters
      .costCenter(this._id)
      .delete()
      .then()
      .catch(async (error) => {
        // Adding one retry in case deletion of dependency i.e. Project has eventual consistency issues
        console.error('Error occurred when trying to delete CostCenter', error);
        console.error(`Attempting retry after ${DEFLAKE_DELAY_IN_MILLISECONDS} ms`);
        await sleep(DEFLAKE_DELAY_IN_MILLISECONDS);
        await defAdminSession.resources.costCenters.costCenter(this._id).delete().then();
      });
  }
}
