/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateProjectRequest } from '../accounts/models/projects/createProjectRequest';
import { DeleteProjectRequest } from '../accounts/models/projects/deleteProjectRequest';
import { GetProjectRequest } from '../accounts/models/projects/getProjectRequest';
import { GetProjectsRequest } from '../accounts/models/projects/getProjectsRequest';
import { ListProjectsRequest } from '../accounts/models/projects/listProjectsRequest';
import { Project } from '../accounts/models/projects/project';
import { UpdateProjectRequest } from '../accounts/models/projects/updateProjectRequest';
import { AuthenticatedUser } from '../authorization/models/authenticatedUser';
import PaginatedResponse from '../base/interfaces/paginatedResponse';

export interface ProjectPlugin {
  /**
   * Creates a new project
   *
   * @param params - the required fields to create a new project
   * @param user - authenticated user creating the project
   * @returns Project object of new project
   */
  createProject(params: CreateProjectRequest, user: AuthenticatedUser): Promise<Project>;

  /**
   * Get project
   * @param request - the request object for getting a project
   *
   * @returns Project entry in DDB
   */
  getProject(request: GetProjectRequest): Promise<Project>;

  /**
   * Get projects
   * @param request - the request object for getting a project
   *
   * @returns Project entry in DDB
   */
  getProjects(request: GetProjectsRequest): Promise<Project[]>;

  /**
   * List projects
   *
   * @param request - the request object for listing projects
   * @returns Project entries in DDB, with optional pagination token
   */
  listProjects(request: ListProjectsRequest): Promise<PaginatedResponse<Project>>;

  /**
   * Soft deletes a project from the database.
   *
   * @param request - a {@link DeleteProjectRequest} object that contains the id of the project to delete
   * @param checkDependencies - an async function that checks if there are dependencies associated with the project
   */
  softDeleteProject(
    request: DeleteProjectRequest,
    checkDependencies: (projectId: string) => Promise<void>
  ): Promise<void>;

  /**
   * Update the name or description of an existing project.
   *
   * @param request - a {@link UpdateProjectRequest} object that contains the id of the project to update
   *                  as well as the new field values
   * @returns a {@link Project} object that reflects the changes requested
   */
  updateProject(request: UpdateProjectRequest): Promise<Project>;
}
