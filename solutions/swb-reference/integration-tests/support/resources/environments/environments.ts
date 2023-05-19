/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import Environment from './environment';

export default class Environments extends CollectionResource {
  private _projectId: string | undefined;

  public constructor(clientSession: ClientSession, projectId?: string) {
    super(clientSession, 'environments', 'environment');
    if (projectId) {
      this._api = `projects/${projectId}/environments`;
      this._projectId = projectId;
    } else {
      this._api = 'environments';
    }
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public environment(id: string): Environment {
    if (!this._projectId) {
      throw new Error('No ProjectID found. Individual environments require a projectId.');
    }
    return new Environment(id, this._clientSession, this._api, this._projectId);
  }

  protected _buildDefaults(resource: EnvironmentCreateRequest): EnvironmentCreateRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    return {
      description: resource.description ?? randomTextGenerator.getFakeText('fakeDescription'),
      name: resource.name ?? randomTextGenerator.getFakeText('fakeName'),
      envTypeId: resource.envTypeId ?? this._settings.get('envTypeId'),
      envTypeConfigId: resource.envTypeConfigId ?? this._settings.get('envTypeConfigId'),
      datasetIds: resource.datasetIds ?? [],
      envType: resource.envType ?? this._settings.get('envType')
    };
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async create(body: any = {}, applyDefault: boolean = true): Promise<AxiosResponse> {
    if (!this._projectId) {
      throw new Error('CreateEnvironments requires a parent Project resource.');
    }
    return super.create(body, applyDefault);
  }

  public async listProjectEnvironments(
    queryParams: Record<string, JSONValue> | undefined = undefined
  ): Promise<AxiosResponse> {
    if (!this._projectId) {
      throw new Error('ListProjectEnvironments requires a parent Project resource.');
    }
    return super.get(queryParams);
  }
}

interface EnvironmentCreateRequest {
  description: string;
  name: string;
  envTypeId: string;
  envTypeConfigId: string;
  datasetIds: string[];
  envType: string;
}
