/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectEnvPlugin, ProjectDeletedError, EnvironmentItem } from '@aws/swb-app';
import { ProjectService } from '@aws/workbench-core-accounts';
import { ProjectStatus } from '@aws/workbench-core-accounts/lib/constants/projectStatus';
import {
  Action,
  AuthenticatedUser,
  CreateIdentityPermissionsRequestParser,
  DynamicAuthorizationService,
  IdentityPermission,
  IdentityPermissionParser
} from '@aws/workbench-core-authorization';
import { PaginatedResponse } from '@aws/workbench-core-base';
import { Environment, EnvironmentService } from '@aws/workbench-core-environments';
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
      description: string;
      name: string;
      projectId: string;
      datasetIds: string[];
      envTypeId: string;
      envTypeConfigId: string;
    },
    authenticatedUser: AuthenticatedUser
  ): Promise<Environment> {
    const projectId = params.projectId;
    const project = await this._projectService.getProject({ projectId });

    if (project.status === ProjectStatus.DELETED) {
      throw new ProjectDeletedError(`Project was deleted`);
    }

    const env: Environment = await this._envService.createEnvironment(
      { ...params, cidr: '', outputs: [] },
      authenticatedUser
    );

    const projectAdmin = getProjectAdminRole(projectId);
    const projectResearcher = getResearcherRole(projectId);

    await this._addAuthZPermissionsForEnv(
      authenticatedUser,
      SwbAuthZSubject.SWB_ENVIRONMENT,
      env.id,
      [projectAdmin, projectResearcher],
      ['READ', 'UPDATE', 'DELETE'],
      projectId
    );

    await this._addAuthZPermissionsForEnv(
      authenticatedUser,
      SwbAuthZSubject.SWB_ENVIRONMENT_CONNECTION,
      env.id,
      [projectAdmin, projectResearcher],
      ['READ'],
      projectId
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
    pageSize?: number,
    paginationToken?: string
  ): Promise<PaginatedResponse<EnvironmentItem>> {
    await this._projectService.getProject({ projectId: projectId });
    return this._envService.listEnvironmentsByProject({ projectId: projectId, pageSize, paginationToken });
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
    actions: Action[],
    projectId: string
  ): Promise<void> {
    const partialIdentityPermission = {
      action: undefined,
      effect: 'ALLOW',
      identityId: undefined,
      identityType: 'GROUP',
      subjectId: subjectId,
      subjectType: subjectType,
      conditions: {
        projectId: { $eq: projectId }
      }
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
