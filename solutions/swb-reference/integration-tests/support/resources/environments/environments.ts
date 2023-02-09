/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { JSONValue } from '@aws/workbench-core-base';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
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

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async create(body: any = {}, applyDefault: boolean = true): Promise<AxiosResponse> {
    // Because of the cleanup logic, before we do the create, we need to ensure that the extender of this collection
    // resource class has a method that returns the resource operations helper for the child resource.
    // For example, if the extender class is 'Users' and it provides childType = 'user', then Users class must have
    // a method called 'user()'.
    // @ts-ignore
    this._api = `projects/${body.projectId}/environments`;
    delete body.projectId;
    const response = super.create(body, applyDefault);
    this._api = 'environments';
    return response;
  }

  public async listProjectEnvironments(
    queryParams: Record<string, JSONValue> | undefined = undefined,
    projectId?: string
  ): Promise<AxiosResponse> {
    projectId = projectId ?? this._settings.get('projectId');
    this._api = `projects/${projectId}/environments`;
    const response = super.get(queryParams);
    this._api = 'environments';
    return response;
  }
}
