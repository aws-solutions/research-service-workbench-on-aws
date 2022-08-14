/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { EnvironmentStatus } from '@aws/workbench-core-environments';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { ENVIRONMENT_START_MAX_WAITING_SECONDS } from '../../utils/constants';
import { sleep } from '../../utils/utilities';
import Resource from '../base/resource';

export default class Environment extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'environment', id, parentApi);
  }

  public async pollEnvironment(
    pollingIntervalInSeconds: number,
    maxWaitTimeInSeconds: number,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    pollingWhile: (env: any) => boolean
  ): Promise<void> {
    const startTimeInMs = Date.now();
    let totalTimeWaitedInSeconds = 0;

    const { data: resource } = await this.get();
    let currentEnv = resource;
    try {
      console.log(`Polling environment ${this._id}. This will take a few minutes.`);
      while (pollingWhile(currentEnv) && totalTimeWaitedInSeconds < maxWaitTimeInSeconds) {
        await sleep(pollingIntervalInSeconds);
        const { data: resource } = await this.get();
        currentEnv = resource;
        totalTimeWaitedInSeconds = (Date.now() - startTimeInMs) / 1000;
      }
      if (totalTimeWaitedInSeconds >= maxWaitTimeInSeconds)
        console.log(`Polling for environment ${this._id} exceeded the time limit.`);
      else console.log(`Polling for environment ${this._id} finished successfully.`);
    } catch (e) {
      console.log(
        `Polling failed for environment. Last known status for env ${this._id} was "${currentEnv.status}". 
        Waited ${totalTimeWaitedInSeconds} seconds for environment to reach valid state so it could finish polling; encountered error: ${e}`
      );
    }
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
      await this.pollEnvironment(
        1500,
        ENVIRONMENT_START_MAX_WAITING_SECONDS,
        (env) => env.status === 'PENDING'
      ); //wating for environment to be completed
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
