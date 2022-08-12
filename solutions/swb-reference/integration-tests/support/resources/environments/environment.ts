/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { EnvironmentStatus } from '@aws/workbench-core-environments';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { sleep } from '../../utils/utilities';
import Resource from '../base/resource';

export default class Environment extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'environment', id, parentApi);
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
    const maxWaitTimeInSeconds = 600;
    const startTimeInMs = Date.now();
    let totalTimeWaitedInSeconds = 0;

    const { data: resource } = await defAdminSession.resources.environments.environment(this._id).get();
    let envStatus: EnvironmentStatus = resource.status;
    if (['TERMINATED', 'TERMINATING'].includes(envStatus)) {
      // Exit early because environment has already been terminated
      return;
    }
    try{
      console.log(`Attempting to delete environment ${this._id}. This will take a few minutes.`)
      while (envStatus === 'PENDING' && totalTimeWaitedInSeconds < maxWaitTimeInSeconds) {
        await sleep(15000);
        const { data: resource } = await defAdminSession.resources.environments.environment(this._id).get();
        envStatus = resource.status;
        totalTimeWaitedInSeconds = (Date.now() - startTimeInMs) / 1000;
      }
      await defAdminSession.resources.environments.environment(this._id).terminate();
      console.log(`Deleted environment ${this._id}`);
    } catch (e){
      console.log(
        `Could not delete environment. Last known status for env ${this._id} was "${envStatus}". 
        Waited ${totalTimeWaitedInSeconds} seconds for environment to reach valid state so it could be deleted; encountered error: ${e}`
      );
    }
    
  }
}
