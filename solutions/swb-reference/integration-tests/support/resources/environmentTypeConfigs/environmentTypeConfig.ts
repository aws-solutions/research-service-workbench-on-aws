/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../clientSession';
import { ListProjectsResponse } from '../../models/projects';
import { DEFLAKE_DELAY_IN_MILLISECONDS } from '../../utils/constants';
import { sleep } from '../../utils/utilities';
import Resource from '../base/resource';
import Projects from '../projects/projects';

export default class EnvironmentTypeConfig extends Resource {
  private _parentId: string;
  private _clientSession: ClientSession;
  public constructor(id: string, clientSession: ClientSession, parentApi: string, parentId: string) {
    super(clientSession, 'environmentTypeConfig', id, parentApi);
    this._parentId = parentId;
    this._clientSession = clientSession;
  }

  public async associate(): Promise<void> {
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling
    return this._axiosInstance.put(`${this._api}/relationships`);
  }

  public async disassociate(): Promise<void> {
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling
    return this._axiosInstance.delete(`${this._api}/relationships`);
  }

  public projects(): Projects {
    return new Projects(this._clientSession, this._api);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //Avoid throttling when terminating multiple environment type configs
    const { data: associatedProjects }: ListProjectsResponse =
      await defAdminSession.resources.environmentTypes
        .environmentType(this._parentId)
        .configurations()
        .environmentTypeConfig(this._id)
        .projects()
        .get();

    if (associatedProjects.data) {
      await Promise.all(
        associatedProjects.data?.map(async (project) => {
          await defAdminSession.resources.projects
            .project(project.id)
            .environmentTypes()
            .environmentType(this._parentId)
            .configurations()
            .environmentTypeConfig(this._id)
            .disassociate();
        })
      );
    }

    await defAdminSession.resources.environmentTypes
      .environmentType(this._parentId)
      .configurations()
      .environmentTypeConfig(this._id)
      .delete();
  }
}
