/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import Environment from './environment';

export default class Environments extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'environments', 'environment');
    this._api = 'environments';
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public environment(id: string, projectId?: string): Environment {
    return new Environment(id, this._clientSession, this._api, projectId);
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
    const projectId = body.projectId ?? this._settings.get('projectId');
    this._api = `projects/${projectId}/environments`;
    delete body.projectId;
    const response = super.create(body, applyDefault);
    this._api = 'environments';
    return response;
  }

  public async listProjectEnvironments(projectId?: string): Promise<AxiosResponse> {
    projectId = projectId ?? this._settings.get('projectId');
    console.log(`kvpark ${projectId}`);
    this._api = `projects/${projectId}/environments`;
    const response = super.get();
    this._api = 'environments';
    return response;
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
