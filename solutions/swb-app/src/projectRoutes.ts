/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { ProjectStatus } from './accounts/constants/projectStatus';
import {
  AssignUserToProjectRequest,
  AssignUserToProjectRequestParser
} from './accounts/models/projects/assignUserToProjectRequest';
import {
  CreateProjectRequest,
  CreateProjectRequestParser
} from './accounts/models/projects/createProjectRequest';
import {
  DeleteProjectRequest,
  DeleteProjectRequestParser
} from './accounts/models/projects/deleteProjectRequest';
import { GetProjectRequest, GetProjectRequestParser } from './accounts/models/projects/getProjectRequest';
import {
  ListProjectsRequest,
  ListProjectsRequestParser
} from './accounts/models/projects/listProjectsRequest';
import {
  ListUsersForRoleRequest,
  ListUsersForRoleRequestParser
} from './accounts/models/projects/listUsersForRoleRequest';
import {
  UpdateProjectRequest,
  UpdateProjectRequestParser
} from './accounts/models/projects/updateProjectRequest';
import resourceTypeToKey from './base/constants/resourceTypeToKey';
import { isInvalidPaginationTokenError } from './base/errors/invalidPaginationTokenError';
import { MetadataService } from './base/services/metadataService';
import { runInBatches } from './base/utilities/promiseUtils';
import { validateAndParse } from './base/utilities/validatorHelper';
import { EnvironmentService } from './environments/services/environmentService';
import { wrapAsync } from './errorHandlers';
import {
  DisassociateUserFromProjectRequest,
  DisassociateUserFromProjectRequestParser
} from './projects/disassociateUserFromProjectRequest';
import { ProjectPlugin } from './projects/projectPlugin';
import {
  ProjectDatasetMetadata,
  ProjectDatasetMetadataParser,
  ProjectEnvTypeConfigMetadata,
  ProjectEnvTypeConfigMetadataParser
} from './schemas/projects/projectMetadataParser';
import { isInvalidParameterError } from './userManagement/errors/invalidParameterError';
import { isRoleNotFoundError } from './userManagement/errors/roleNotFoundError';
import { isUserNotFoundError } from './userManagement/errors/userNotFoundError';
import { isUserRolesExceedLimitError } from './userManagement/errors/userRolesExceedLimitError';
import { User } from './userManagement/user';
import { UserManagementService } from './userManagement/userManagementService';

export function setUpProjectRoutes(
  router: Router,
  projectService: ProjectPlugin,
  environmentService: EnvironmentService,
  metadataService: MetadataService,
  userService: UserManagementService
): void {
  // Get project
  router.get(
    '/projects/:projectId',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetProjectRequest>(GetProjectRequestParser, {
        projectId: req.params.projectId
      });
      res.send(await projectService.getProject(validatedRequest));
    })
  );

  // List projects
  router.get(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListProjectsRequest>(ListProjectsRequestParser, {
        ...req.query,
        user: res.locals.user
      });

      try {
        res.send(await projectService.listProjects(validatedRequest));
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing projects`);
      }
    })
  );

  // Create project
  router.post(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateProjectRequest>(CreateProjectRequestParser, {
        ...req.body
      });
      res.send(await projectService.createProject(validatedRequest, res.locals.user));
    })
  );

  // Soft delete project
  router.delete(
    '/projects/:projectId',
    wrapAsync(async (req: Request, res: Response) => {
      async function checkDependencies(projectId: string): Promise<void> {
        // environments
        const projectHasEnvironments = environmentService.doesDependencyHaveEnvironments(projectId);

        // datasets
        const datasetDependency = metadataService.listDependentMetadata<ProjectDatasetMetadata>(
          resourceTypeToKey.project,
          projectId,
          resourceTypeToKey.dataset,
          ProjectDatasetMetadataParser,
          { pageSize: 1 }
        );

        // etcs
        const envTypeConfigDepedency = metadataService.listDependentMetadata<ProjectEnvTypeConfigMetadata>(
          resourceTypeToKey.project,
          projectId,
          resourceTypeToKey.envTypeConfig,
          ProjectEnvTypeConfigMetadataParser,
          { pageSize: 1 }
        );

        const [hasEnvironments, { data: datasets }, { data: envTypeConfigs }] = await Promise.all([
          projectHasEnvironments,
          datasetDependency,
          envTypeConfigDepedency
        ]);

        if (hasEnvironments) {
          throw Boom.conflict(
            `Project ${projectId} cannot be deleted because it has environments(s) associated with it`
          );
        }

        if (datasets.length) {
          throw Boom.conflict(
            `Project ${projectId} cannot be deleted because it has dataset(s) associated with it`
          );
        }

        if (envTypeConfigs.length) {
          throw Boom.conflict(
            `Project ${projectId} cannot be deleted because it has environment type config(s) associated with it`
          );
        }
      }
      // validate request
      const validatedRequest = validateAndParse<DeleteProjectRequest>(DeleteProjectRequestParser, {
        ...req.params,
        authenticatedUser: res.locals.user
      });
      // delete project
      await projectService.softDeleteProject(validatedRequest, checkDependencies);
      res.status(204).send();
    })
  );

  // Update project
  router.patch(
    '/projects/:projectId',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<UpdateProjectRequest>(UpdateProjectRequestParser, {
        projectId: req.params.projectId,
        updatedValues: { ...req.body }
      });

      res.send(await projectService.updateProject(validatedRequest));
    })
  );

  // add user to the project
  router.post(
    '/projects/:projectId/users/:userId/relationships',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<AssignUserToProjectRequest>(
        AssignUserToProjectRequestParser,
        {
          projectId: req.params.projectId,
          userId: req.params.userId,
          role: req.body.role
        }
      );

      const groupId = `${validatedRequest.projectId}#${req.body.role}`;

      try {
        const existingUser = await userService.getUser(validatedRequest.userId);

        const isITAdmin = existingUser.roles.some((role: string) => role === 'ITAdmin');
        if (isITAdmin) {
          throw Boom.badRequest(
            `IT Admin ${validatedRequest.userId} cannot be assigned to the project ${validatedRequest.projectId}`
          );
        }

        // this call is needed to validate that project and ensure group exists.
        const [projectResponse] = await Promise.allSettled([
          projectService.getProject({ projectId: validatedRequest.projectId }),
          userService.createRole(groupId)
        ]);

        if (projectResponse.status === 'rejected') {
          throw projectResponse.reason;
        }

        const project = projectResponse.value;
        if (project.status !== ProjectStatus.AVAILABLE) {
          console.warn(`Cannot list users for project ${project.id} because status is ${project.status}`);
          throw Boom.notFound(`Could not find project ${project.id}`);
        }

        const groups = await userService.getUserRoles(validatedRequest.userId);

        const isUserAssignedToProject = groups.some((id) => id === groupId);
        if (isUserAssignedToProject) {
          throw Boom.badRequest(
            `User ${validatedRequest.userId} is already assigned to the project ${validatedRequest.projectId}`
          );
        }

        await userService.addUserToRole(validatedRequest.userId, groupId);

        res.status(204).send();
      } catch (err) {
        if (isUserNotFoundError(err)) {
          throw Boom.notFound(`Could not find user ${validatedRequest.userId}`);
        }

        if (isUserRolesExceedLimitError(err)) {
          throw Boom.badRequest(err.message);
        }

        if (Boom.isBoom(err)) {
          throw err;
        }

        throw Boom.badImplementation(
          `Could not add user ${validatedRequest.userId} to the project ${validatedRequest.projectId}`
        );
      }
    })
  );

  // remove user from the project
  router.delete(
    '/projects/:projectId/users/:userId/relationships',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<DisassociateUserFromProjectRequest>(
        DisassociateUserFromProjectRequestParser,
        {
          projectId: req.params.projectId,
          userId: req.params.userId
        }
      );
      const { userId, projectId } = validatedRequest;
      try {
        await Promise.all([userService.getUser(userId), projectService.getProject({ projectId })]);

        const groups = await userService.getUserRoles(userId);

        const promises = groups
          .filter((groupId: string) => groupId.includes(projectId))
          .map((groupId: string) => userService.removeUserFromRole(userId, groupId));

        await Promise.all(promises);
        res.status(204).send();
      } catch (err) {
        if (isUserNotFoundError(err)) {
          throw Boom.notFound(`Could not find user ${userId}`);
        }

        if (Boom.isBoom(err)) {
          throw err;
        }

        throw Boom.badImplementation(`Could not remove user ${userId} from the project ${projectId}`);
      }
    })
  );

  // list users for role
  router.get(
    '/projects/:projectId/users',
    wrapAsync(async (req: Request, res: Response) => {
      const projectId = req.params.projectId;
      const validatedRequest = validateAndParse<ListUsersForRoleRequest>(ListUsersForRoleRequestParser, {
        projectId,
        ...req.query
      });

      try {
        const project = await projectService.getProject({ projectId });
        if (project.status !== ProjectStatus.AVAILABLE) {
          console.warn(`Cannot list users for project ${projectId} because status is ${project.status}`);
          throw Boom.notFound(`Could not find project ${projectId}`);
        }

        try {
          const response = await userService.listUsersForRole(validatedRequest);
          const userPromises = response.data.map((userId: string) => userService.getUser(userId));

          const users = await runInBatches<User>(userPromises, 10);
          res.send({
            data: users,
            paginationToken: response.paginationToken
          });
        } catch (err) {
          console.error(err);
          if (isRoleNotFoundError(err)) {
            res.send({ data: [] });
            return;
          }

          throw err;
        }
      } catch (err) {
        console.error(err);

        if (isInvalidPaginationTokenError(err) || isInvalidParameterError(err)) {
          throw Boom.badRequest(err.message);
        }

        if (Boom.isBoom(err)) {
          throw err;
        }

        const groupId = `${projectId}#${validatedRequest.role}`;
        throw Boom.badImplementation(`Could not list users for role ${groupId} for the project ${projectId}`);
      }
    })
  );
}
