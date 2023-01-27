/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  ProjectService,
  CreateProjectRequest,
  CreateProjectRequestParser,
  ListProjectsRequest,
  ListProjectsRequestParser,
  UpdateProjectRequest,
  UpdateProjectRequestParser,
  GetProjectRequest,
  GetProjectRequestParser,
  DeleteProjectRequest,
  DeleteProjectRequestParser,
  AssignUserToProjectRequestParser,
  AssignUserToProjectRequest
} from '@aws/workbench-core-accounts';
import { ProjectStatus } from '@aws/workbench-core-accounts/lib/constants/projectStatus';
import { validateAndParse, MetadataService, resourceTypeToKey, runInBatches } from '@aws/workbench-core-base';
import { EnvironmentService } from '@aws/workbench-core-environments';
import {
  isUserNotFoundError,
  UserManagementService,
  User,
  isRoleNotFoundError
} from '@aws/workbench-core-user-management';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import {
  ProjectDatasetMetadata,
  ProjectDatasetMetadataParser,
  ProjectEnvTypeConfigMetadata,
  ProjectEnvTypeConfigMetadataParser
} from './schemas/projects/projectMetadataParser';

export function setUpProjectRoutes(
  router: Router,
  projectService: ProjectService,
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

      res.send(await projectService.listProjects(validatedRequest));
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
  router.put(
    '/projects/:projectId/softDelete',
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
    '/projects/:projectId/users/:userId',
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

        const isITAdmin = existingUser.roles.some((role) => role === 'ITAdmin');
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
    '/projects/:projectId/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      const projectId = req.params.projectId;

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
    '/projects/:projectId/users/:role',
    wrapAsync(async (req: Request, res: Response) => {
      const projectId = req.params.projectId;
      const role = req.params.role;
      const groupId = `${projectId}#${role}`;

      try {
        const project = await projectService.getProject({ projectId });
        if (project.status !== ProjectStatus.AVAILABLE) {
          console.warn(`Cannot list users for project ${projectId} because status is ${project.status}`);
          throw Boom.notFound(`Could not find project ${projectId}`);
        }

        try {
          const userIds = await userService.listUsersForRole(groupId);
          const userPromises = userIds.map((userId) => userService.getUser(userId));

          const users = await runInBatches<User>(userPromises, 10);
          res.send({ users });
        } catch (err) {
          if (isRoleNotFoundError(err)) {
            res.send({ users: [] });
            return;
          }

          throw err;
        }
      } catch (err) {
        if (Boom.isBoom(err)) {
          throw err;
        }

        throw Boom.badImplementation(`Could not list users for role ${role} for the project ${projectId}`);
      }
    })
  );
}
