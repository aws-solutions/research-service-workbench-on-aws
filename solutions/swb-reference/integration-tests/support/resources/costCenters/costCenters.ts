/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import CostCenter from './costCenter';

export default class CostCenters extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'costCenters', 'costCenter');
    this._api = 'costCenters';
  }

  public costCenter(id: string): CostCenter {
    return new CostCenter(id, this._clientSession, this._api);
  }

  protected _buildDefaults(resource: CostCenterCreateRequest): CostCenterCreateRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    return {
      name: resource.name ?? randomTextGenerator.getFakeText('costCenterName'),
      accountId: resource.accountId ?? randomTextGenerator.getFakeText('accountId'),
      description: resource.description ?? randomTextGenerator.getFakeText('description')
    };
  }
}

interface CostCenterCreateRequest {
  name: string;
  accountId: string;
  description: string;
}
