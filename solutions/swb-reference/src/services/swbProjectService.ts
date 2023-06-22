/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectPlugin } from '@aws/swb-app';
import {
  CreateProjectRequest,
  DeleteProjectRequest,
  GetProjectRequest,
  GetProjectsRequest,
  ListProjectsRequest,
  Project,
  ProjectService,
  UpdateProjectRequest
} from '@aws/workbench-core-accounts';
import {
  AuthenticatedUser,
  CreateIdentityPermissionsRequestParser,
  DeleteGroupRequest,
  DeleteIdentityPermissionsRequestParser,
  DynamicAuthorizationService,
  GroupNotFoundError,
  IdentityPermission,
  IdentityPermissionParser
} from '@aws/workbench-core-authorization';
import { PaginatedResponse } from '@aws/workbench-core-base';
import { SwbAuthZSubject } from '../constants';
import { getProjectAdminRole, getResearcherRole } from '../utils/roleUtils';

export class SWBProjectService implements ProjectPlugin {
  private _dynamicAuthorizationService: DynamicAuthorizationService;
  private _projectService: ProjectService;

  public constructor(
    dynamicAuthorizationService: DynamicAuthorizationService,
    projectService: ProjectService
  ) {
    this._dynamicAuthorizationService = dynamicAuthorizationService;
    this._projectService = projectService;
  }

  /**
   * Creates a new project
   *
   * @param params - the required fields to create a new project
   * @param user - authenticated user creating the project
   * @returns Project object of new project
   */
  public async createProject(params: CreateProjectRequest, user: AuthenticatedUser): Promise<Project> {
    const createProjectResponse = await this._projectService.createProject(params);
    const projectId = createProjectResponse.id;
    const paRole = getProjectAdminRole(projectId);
    const researcherRole = getResearcherRole(projectId);

    await this._dynamicAuthorizationService.createGroup({
      authenticatedUser: user,
      groupId: paRole,
      description: `Project Admin group for ${projectId}`
    });
    await this._dynamicAuthorizationService.createGroup({
      authenticatedUser: user,
      groupId: researcherRole,
      description: `Researcher group for ${projectId}`
    });

    // Create PA Permissions
    const paIdentityPermissions: IdentityPermission[] = this._generatePAIdentityPermissions(
      projectId,
      paRole
    );

    // Create Researcher Permissions
    const researcherIdentityPermissions: IdentityPermission[] = this._generateResearcherIdentityPermissions(
      projectId,
      researcherRole
    );

    const createIdentityPermissionsRequest = CreateIdentityPermissionsRequestParser.parse({
      authenticatedUser: user,
      identityPermissions: [...paIdentityPermissions, ...researcherIdentityPermissions]
    });

    await this._dynamicAuthorizationService.createIdentityPermissions(createIdentityPermissionsRequest);

    return createProjectResponse;
  }

  /**
   * Get project
   * @param request - the request object for getting a project
   *
   * @returns Project entry in DDB
   */
  public async getProject(request: GetProjectRequest): Promise<Project> {
    return this._projectService.getProject(request);
  }

  /**
   * Get projects
   * @param request - the request object for getting a project
   *
   * @returns Project entry in DDB
   */
  public async getProjects(request: GetProjectsRequest): Promise<Project[]> {
    return this._projectService.getProjects(request);
  }

  /**
   * List projects
   *
   * @param request - the request object for listing projects
   * @returns Project entries in DDB, with optional pagination token
   */
  public async listProjects(request: ListProjectsRequest): Promise<PaginatedResponse<Project>> {
    const getUserGroupsResponse = await this._dynamicAuthorizationService.getUserGroups({
      authenticatedUser: request.user,
      userId: request.user.id
    });
    return this._projectService.listProjects(request, getUserGroupsResponse.data.groupIds);
  }

  /**
   * Soft deletes a project from the database.
   *
   * @param request - a {@link DeleteProjectRequest} object that contains the id of the project to delete
   * @param checkDependencies - an async function that checks if there are dependencies associated with the project
   */
  public async softDeleteProject(
    request: DeleteProjectRequest,
    checkDependencies: (projectId: string) => Promise<void>
  ): Promise<void> {
    await this._projectService.softDeleteProject(request, checkDependencies);

    const authenticatedUser = request.authenticatedUser;
    const projectId: string = request.projectId;
    const paRole: string = getProjectAdminRole(projectId);
    const researcherRole: string = getResearcherRole(projectId);

    // Get PA Permissions to delete
    const paIdentityPermissions: IdentityPermission[] = this._generatePAIdentityPermissions(
      projectId,
      paRole
    );

    // Get Researcher Permissions to delete
    const researcherIdentityPermissions: IdentityPermission[] = this._generateResearcherIdentityPermissions(
      projectId,
      researcherRole
    );

    const deleteIdentityPermissionsRequest = DeleteIdentityPermissionsRequestParser.parse({
      authenticatedUser,
      identityPermissions: [...paIdentityPermissions, ...researcherIdentityPermissions]
    });

    await this._dynamicAuthorizationService.deleteIdentityPermissions(deleteIdentityPermissionsRequest);

    await this._idempotentGroupDeletion({
      authenticatedUser,
      groupId: paRole
    });

    await this._idempotentGroupDeletion({
      authenticatedUser,
      groupId: researcherRole
    });
  }

  /**
   * Performs an idempotent group deletion so that an error does not get thrown if group already doesn't exist.
   * @param request - DeleteGroupRequest
   */
  private async _idempotentGroupDeletion(request: DeleteGroupRequest): Promise<void> {
    try {
      await this._dynamicAuthorizationService.deleteGroup(request);
    } catch (e) {
      if (!(e instanceof GroupNotFoundError)) {
        throw e;
      }
      console.warn(`Group ${request.groupId} was not found.`);
    }
  }

  /**
   * Update the name or description of an existing project.
   *
   * @param request - a {@link UpdateProjectRequest} object that contains the id of the project to update
   *                  as well as the new field values
   * @returns a {@link Project} object that reflects the changes requested
   */
  public async updateProject(request: UpdateProjectRequest): Promise<Project> {
    return this._projectService.updateProject(request);
  }

  private _generatePAIdentityPermissions(projectId: string, paRole: string): IdentityPermission[] {
    return [
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_DATASET, ['CREATE'], paRole, {
        projectId: { $eq: projectId }
      }),
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_DATASET_LIST, ['READ'], paRole, {
        projectId: { $eq: projectId }
      }),
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_ENVIRONMENT, ['CREATE', 'READ'], paRole, {
        projectId: { $eq: projectId }
      }),
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_ENVIRONMENT_TYPE, ['READ'], paRole),
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_ETC, ['READ'], paRole, {
        projectId: { $eq: projectId }
      }),
      // Adding a permission for ListProjects so that as soon as a Project Admin gets added to their first project
      // they can begin to call ListProjects
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_PROJECT_LIST, ['READ'], paRole),
      // Access for GetProject and GetProjects
      ...this._generateIdentityPermissions(
        projectId,
        SwbAuthZSubject.SWB_PROJECT,
        ['READ', 'UPDATE', 'DELETE'],
        paRole
      ),
      ...this._generateIdentityPermissions(
        '*',
        SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION,
        ['CREATE', 'READ', 'DELETE'],
        paRole,
        { projectId: { $eq: projectId } }
      ),
      // Adding a permission for SSH Key
      ...this._generateIdentityPermissions(
        '*',
        SwbAuthZSubject.SWB_SSH_KEY,
        ['CREATE', 'READ', 'DELETE'],
        paRole,
        {
          projectId: { $eq: projectId }
        }
      ),
      // Adding a permission for ListUsers so that as soon as a Project Admin gets added to their first project
      // they can begin to call ListUsers and GetUser
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_USER, ['READ'], paRole)
    ];
  }

  private _generateResearcherIdentityPermissions(
    projectId: string,
    researcherRole: string
  ): IdentityPermission[] {
    return [
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_DATASET_LIST, ['READ'], researcherRole, {
        projectId: { $eq: projectId }
      }),
      ...this._generateIdentityPermissions(
        '*',
        SwbAuthZSubject.SWB_ENVIRONMENT,
        ['CREATE', 'READ'],
        researcherRole,
        { projectId: { $eq: projectId } }
      ),
      ...this._generateIdentityPermissions(
        '*',
        SwbAuthZSubject.SWB_ENVIRONMENT_TYPE,
        ['READ'],
        researcherRole
      ),
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_ETC, ['READ'], researcherRole, {
        projectId: { $eq: projectId }
      }),
      // Adding a permission for ListProjects so that as soon as a Researcher gets added to their first project
      // they can begin to call ListProjects
      ...this._generateIdentityPermissions('*', SwbAuthZSubject.SWB_PROJECT_LIST, ['READ'], researcherRole),
      // Access for GetProject and GetProjects
      ...this._generateIdentityPermissions(projectId, SwbAuthZSubject.SWB_PROJECT, ['READ'], researcherRole),
      ...this._generateIdentityPermissions(
        '*',
        SwbAuthZSubject.SWB_SSH_KEY,
        ['CREATE', 'READ', 'DELETE'],
        researcherRole,
        { projectId: { $eq: projectId } }
      )
    ];
  }

  /***
   * Generates the default identity permissions for the project
   * @param projectId - the project the permissions are being generated for
   * @returns an array of Identity Permissions
   */
  private _generateIdentityPermissions(
    subjectId: string,
    subjectType: string,
    actions: string[],
    role: string,
    conditions?: object
  ): IdentityPermission[] {
    let partialIdentityPermission = {
      effect: 'ALLOW',
      identityType: 'GROUP',
      subjectId: subjectId,
      subjectType: subjectType
    };

    if (conditions) {
      partialIdentityPermission = { ...partialIdentityPermission, ...{ conditions: conditions } };
    }

    const identityPermissions: IdentityPermission[] = [];

    for (const action of actions) {
      const identityPermission = IdentityPermissionParser.parse({
        ...partialIdentityPermission,
        identityId: role,
        action
      });
      identityPermissions.push(identityPermission);
    }

    return identityPermissions;
  }
}
