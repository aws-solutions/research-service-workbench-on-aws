/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import { DEFLAKE_DELAY_IN_MILLISECONDS } from '../../utils/constants';
import { sleep } from '../../utils/utilities';
import Resource from '../base/resource';

export default class EnvironmentTypeConfig extends Resource {
  private _envTypeId: string;
  public constructor(id: string, clientSession: ClientSession, parentApi: string, envTypeId: string) {
    const prefix = `environmentTypes/${envTypeId}/${parentApi}`;
    super(clientSession, 'environmentTypeConfig', id, prefix);
    this._envTypeId = envTypeId;
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when terminating multiple environment type configs
    await defAdminSession.resources.environmentTypeConfigs
      .environmentTypeConfig(this._id, this._envTypeId)
      .delete();
  }
}
