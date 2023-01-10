/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectEnvPlugin } from '@aws/swb-app';
import { ProjectService } from '@aws/workbench-core-accounts';
import {
  AuthenticatedUser,
  DynamicAuthorizationService,
  IdentityPermission
} from '@aws/workbench-core-authorization';
import { Environment, EnvironmentService, EnvironmentStatus } from '@aws/workbench-core-environments';

export class ProjectEnvService implements ProjectEnvPlugin {
  private _dynamicAuthorizationService: DynamicAuthorizationService;
  private _envService: EnvironmentService;
  private _projectService: ProjectService;

  public constructor(
    dynamicAuthorizationService: DynamicAuthorizationService,
    envService: EnvironmentService,
    projectService: ProjectService
  ) {
    this._dynamicAuthorizationService = dynamicAuthorizationService;
    this._envService = envService;
    this._projectService = projectService;
  }

  public async createEnvironment(
    params: {
      instanceId?: string;
      cidr: string;
      description: string;
      error?: { type: string; value: string };
      name: string;
      outputs: { id: string; value: string; description: string }[];
      projectId: string;
      datasetIds: string[];
      envTypeId: string;
      envTypeConfigId: string;
      status?: EnvironmentStatus;
    },
    authenticatedUser: AuthenticatedUser
  ): Promise<Environment> {
    await this._projectService.getProject(params.projectId);
    const env = await this._envService.createEnvironment(params, authenticatedUser);
    try {
      const identityPermissions: IdentityPermission[] = [
        // RUD #PA & #Researchers
      ];
      await this._dynamicAuthorizationService.createIdentityPermissions({
        authenticatedUser,
        identityPermissions
      });
    } catch (e) {
      console.log(e);
    }
    return env;
  }

  public async getEnvironment(
    projectId: string,
    envId: string,
    includeMetadata: boolean = false
  ): Promise<Environment> {
    await this._projectService.getProject(projectId);
    return this._envService.getEnvironment(envId, includeMetadata);
  }

  public async listProjectEnvs(
    projectId: string,
    paginationParams: string
  ): Promise<{ data: Environment[]; paginationToken: string | undefined }> {
    await this._projectService.getProject(projectId);
    return new Promise(() => {});
    // const envs =
    //   relationshipIds?.data?.length > 0
    //     ? await this._envService.listEnvironmentsForProject(projectId)
    //     : [];
    // return {
    //   data: envs,
    //   paginationToken: relationshipIds.paginationToken
    // };
  }

  public async updateEnvironment(
    envId: string,
    projectId: string,
    updatedValues: {
      [key: string]:
        | string
        | { type: string; value: string }
        | { id: string; value: string; description: string }[];
    }
  ): Promise<Environment> {
    await this._projectService.getProject(projectId);
    return this._envService.updateEnvironment(envId, updatedValues);
  }
}
