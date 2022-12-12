/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import EnvironmentTypeConfig from './environmentTypeConfig';

export default class EnvironmentTypeConfigs extends CollectionResource {
  private _parentId: string;
  public constructor(clientSession: ClientSession, parentApi: string, parentId: string) {
    super(clientSession, 'environmentTypeConfigs', 'environmentTypeConfig');
    this._api = `${parentApi}/configurations`;
    this._parentId = parentId;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public environmentTypeConfig(id: string): EnvironmentTypeConfig {
    return new EnvironmentTypeConfig(id, this._clientSession, this._api, this._parentId);
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
