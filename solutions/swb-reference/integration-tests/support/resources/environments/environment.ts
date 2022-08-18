/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { EnvironmentStatus } from '@aws/workbench-core-environments';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { ENVIRONMENT_START_MAX_WAITING_SECONDS } from '../../utils/constants';
import { poll } from '../../utils/utilities';
import Resource from '../base/resource';

export default class Environment extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'environment', id, parentApi);
  }

  public async connect(): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/connections`);
  }

  public async stop(): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/stop`);
  }

  public async start(): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/start`);
  }

  public async terminate(): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/terminate`);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const { data: resource } = await defAdminSession.resources.environments.environment(this._id).get();
    let envStatus: EnvironmentStatus = resource.status;
    if (['TERMINATED', 'TERMINATING'].includes(envStatus)) {
      // Exit early because environment has already been terminated
      return;
    }
    try {
      console.log(`Attempting to delete environment ${this._id}. This will take a few minutes.`);
      await poll(
        async () => await defAdminSession.resources.environments.environment(this._id).get(),
        (env) => env?.data?.status !== 'PENDING' && env?.data?.status !== 'STARTING',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      );
      const { data: completedResource } = await defAdminSession.resources.environments
        .environment(this._id)
        .get();
      envStatus = completedResource.status;
      console.log(`Terminating environment ${this._id}.`);
      await defAdminSession.resources.environments.environment(this._id).terminate();
      console.log(`Deleted environment ${this._id}`);
    } catch (e) {
      console.log(
        `Could not delete environment. Last known status for env ${this._id} was "${envStatus}". 
        Encountered error: ${e}`
      );
    }
  }
}
