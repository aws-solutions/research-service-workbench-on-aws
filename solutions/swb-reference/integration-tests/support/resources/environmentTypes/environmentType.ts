/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import { EnvironmentTypeHelper } from '../../complex/environmentTypeHelper';
import { DEFLAKE_DELAY_IN_MILLISECONDS } from '../../utils/constants';
import { sleep } from '../../utils/utilities';
import Resource from '../base/resource';
import EnvironmentTypeConfigs from '../environmentTypeConfigs/environmentTypeConfigs';

export default class EnvironmentType extends Resource {
  private _clientSession: ClientSession;
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'environmentType', id, parentApi);
    this._clientSession = clientSession;
  }

  public configurations(): EnvironmentTypeConfigs {
    return new EnvironmentTypeConfigs(this._clientSession, this._api, this._id);
  }

  protected async cleanup(): Promise<void> {
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when terminating multiple environment types
    const envTypeHelper = new EnvironmentTypeHelper();
    await envTypeHelper.deleteEnvironmentType(this._id);
  }
}
