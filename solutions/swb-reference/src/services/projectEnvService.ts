/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectEnvPlugin } from '@aws/swb-app';
import { ProjectService } from '@aws/workbench-core-accounts';
import {
  Action,
  AuthenticatedUser,
  CreateIdentityPermissionsRequestParser,
  DynamicAuthorizationService,
  IdentityPermission,
  IdentityPermissionParser
} from '@aws/workbench-core-authorization';
import { Environment, EnvironmentService, EnvironmentStatus } from '@aws/workbench-core-environments';
import { SwbAuthZSubject } from '../constants';
import { getProjectAdminRole, getResearcherRole } from '../utils/roleUtils';

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
    await this._projectService.getProject({ projectId: params.projectId });

    const env: Environment = await this._envService.createEnvironment(params, authenticatedUser);

    const projectAdmin = getProjectAdminRole(params.projectId);
    const projectResearcher = getResearcherRole(params.projectId);

    await this._addAuthZPermissionsForEnv(
      authenticatedUser,
      SwbAuthZSubject.SWB_ENVIRONMENT,
      env.id,
      [projectAdmin, projectResearcher],
      ['READ', 'UPDATE', 'DELETE']
    );

    await this._addAuthZPermissionsForEnv(
      authenticatedUser,
      SwbAuthZSubject.SWB_ENVIRONMENT_CONNECTION,
      env.id,
      [projectAdmin, projectResearcher],
      ['READ']
    );

    return env;
  }

  public async getEnvironment(
    projectId: string,
    envId: string,
    includeMetadata: boolean = false
  ): Promise<Environment> {
    await this._projectService.getProject({ projectId: projectId });
    return this._envService.getEnvironment(envId, includeMetadata);
  }

  public async listProjectEnvs(
    projectId: string,
    user: AuthenticatedUser,
    filter?: {
      status?: EnvironmentStatus;
      name?: string;
      createdAtFrom?: string;
      createdAtTo?: string;
      owner?: string;
      type?: string;
    },
    pageSize?: number,
    paginationToken?: string,
    sort?: {
      status?: boolean;
      name?: boolean;
      createdAt?: boolean;
      owner?: boolean;
      type?: boolean;
    }
  ): Promise<{ data: Environment[]; paginationToken: string | undefined }> {
    await this._projectService.getProject({ projectId: projectId });
    interface ProjectFilter {
      status?: EnvironmentStatus;
      name?: string;
      createdAtFrom?: string;
      createdAtTo?: string;
      owner?: string;
      type?: string;
      projectId: string;
    }
    const projectFilter: ProjectFilter = (filter ? filter : { projectId: projectId }) as ProjectFilter;
    projectFilter.projectId = projectId;
    return this._envService.listEnvironments(user, projectFilter, pageSize, paginationToken, sort);
  }

  public async updateEnvironment(
    projectId: string,
    envId: string,
    updatedValues: {
      [key: string]:
        | string
        | { type: string; value: string }
        | { id: string; value: string; description: string }[];
    }
  ): Promise<Environment> {
    await this._projectService.getProject({ projectId: projectId });
    return this._envService.updateEnvironment(envId, updatedValues);
  }

  private async _addAuthZPermissionsForEnv(
    authenticatedUser: AuthenticatedUser,
    subjectType: string,
    subjectId: string,
    roles: string[],
    actions: Action[]
  ): Promise<void> {
    const partialIdentityPermission = {
      action: undefined,
      effect: 'ALLOW',
      identityId: undefined,
      identityType: 'GROUP',
      subjectId: subjectId,
      subjectType: subjectType
    };

    const identityPermissions: IdentityPermission[] = [];

    for (const role of roles) {
      for (const action of actions) {
        const identityPermission = IdentityPermissionParser.parse({
          ...partialIdentityPermission,
          identityId: role,
          action
        });
        identityPermissions.push(identityPermission);
      }
    }

    const createIdentityPermissionsRequest = CreateIdentityPermissionsRequestParser.parse({
      authenticatedUser,
      identityPermissions
    });

    await this._dynamicAuthorizationService.createIdentityPermissions(createIdentityPermissionsRequest);
  }
}
