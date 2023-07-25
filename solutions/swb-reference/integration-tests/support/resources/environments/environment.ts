/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { EnvironmentStatus } from '@aws/workbench-core-environments';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { ENVIRONMENT_START_MAX_WAITING_SECONDS, DEFLAKE_DELAY_IN_MILLISECONDS } from '../../utils/constants';
import { poll, sleep } from '../../utils/utilities';
import Resource from '../base/resource';

export default class Environment extends Resource {
  private _projectId: string;

  public constructor(id: string, clientSession: ClientSession, parentApi: string, projectId: string) {
    super(clientSession, 'environment', id, parentApi);
    this._projectId = projectId;
  }

  public async connect(): Promise<AxiosResponse> {
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when connecting to multiple environments
    return this._axiosInstance.get(`${this._api}/connections`);
  }

  public async stop(): Promise<AxiosResponse> {
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when stopping multiple environments
    return this._axiosInstance.put(`${this._api}/stop`);
  }

  public async start(): Promise<AxiosResponse> {
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when starting multiple environments
    return this._axiosInstance.put(`${this._api}/start`);
  }

  public async terminate(): Promise<AxiosResponse> {
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when terminating multiple environments
    return this._axiosInstance.put(`${this._api}/terminate`);
  }

  public async sshKeys(): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/sshKeys`);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const { data: resource } = await defAdminSession.resources.projects
      .project(this._projectId)
      .environments()
      .environment(this._id)
      .get();
    let envStatus: EnvironmentStatus = resource.status;
    if (['TERMINATED'].includes(envStatus)) {
      // Exit early because environment has already been terminated
      return;
    }

    try {
      console.log(`Attempting to delete environment ${this._id}. This will take a few minutes.`);
      await poll(
        async () =>
          defAdminSession.resources.projects
            .project(this._projectId)
            .environments()
            .environment(this._id)
            .get(),
        (env) => !['PENDING', 'STOPPING', 'STARTING'].includes(env?.data?.status),
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      );

      if (!['STOPPED', 'TERMINATING'].includes(envStatus)) {
        console.log(
          `Environment must be stopped to terminate. Currently in state ${envStatus}. Stopping environment ${this._id}.`
        );
        await defAdminSession.resources.projects
          .project(this._projectId)
          .environments()
          .environment(this._id)
          .stop();
        await poll(
          async () =>
            defAdminSession.resources.projects
              .project(this._projectId)
              .environments()
              .environment(this._id)
              .get(),
          (env) => env?.data?.status === 'STOPPED',
          ENVIRONMENT_START_MAX_WAITING_SECONDS
        );
      }

      const { data: completedResource } = await defAdminSession.resources.projects
        .project(this._projectId)
        .environments()
        .environment(this._id)
        .get();
      envStatus = completedResource.status;
      console.log(`Terminating environment ${this._id}.`);
      await defAdminSession.resources.projects
        .project(this._projectId)
        .environments()
        .environment(this._id)
        .terminate();
      await poll(
        async () =>
          defAdminSession.resources.projects
            .project(this._projectId)
            .environments()
            .environment(this._id)
            .get(),
        (env) => env?.data?.status === 'TERMINATED',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      );
      console.log(`Deleted environment ${this._id}`);
    } catch (e) {
      console.log(
        `Could not delete environment. Last known status for env ${this._id} was "${envStatus}". 
        Encountered error: ${e}`
      );
    }
  }
}
