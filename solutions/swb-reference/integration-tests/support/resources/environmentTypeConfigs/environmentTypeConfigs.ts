/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import EnvironmentTypeConfig from './environmentTypeConfig';

export default class EnvironmentTypeConfigs extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'environmentTypeConfigs', 'environmentTypeConfig', 'environmentTypes/:parentId/');
    this._api = 'configurations';
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public environmentTypeConfig(id: string, envTypeId: string): EnvironmentTypeConfig {
    return new EnvironmentTypeConfig(id, this._clientSession, this._api, envTypeId);
  }

  protected _buildDefaults(resource: ETCCreateRequest): ETCCreateRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    return {
      description: resource.description ?? randomTextGenerator.getFakeText('fakeDescription'),
      name: resource.name ?? randomTextGenerator.getFakeText('fakeName'),
      type: resource.type ?? randomTextGenerator.getFakeText('fakeType'),
      params: resource.params ?? [],
      estimatedCost: resource.name ?? randomTextGenerator.getFakeText('fakeEstimatedCost')
    };
  }
}

interface ETCCreateRequest {
  description: string;
  name: string;
  type: string;
  estimatedCost: string;
  params: string[];
}
