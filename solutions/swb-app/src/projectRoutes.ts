/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectService } from '@aws/workbench-core-accounts';
import { isUserNotFoundError, UserManagementService } from '@aws/workbench-core-authentication';
import { PermissionsService } from '@aws/workbench-core-authorization';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { wrapAsync } from './errorHandlers';
import AssignUserToProject from './schemas/assignUserToProject';
import { PermissionRoles } from './staticPermissionsConfig';
import { processValidatorResult } from './validatorHelper';

export function setUpProjectRoutes(
  router: Router,
  projectService: ProjectService,
  userService: UserManagementService,
  authService: PermissionsService
): void {
  // Get projects
  router.get(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const projects = await projectService.listProjects();
      res.send(projects);
    })
  );

  // add user to the project
  router.post(
    '/projects/:projectId/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, AssignUserToProject));

      const userId = req.params.userId;
      const projectId = req.params.projectId;
      const groupId = `${projectId}#${req.body.role}`;

      try {
        const existingUser = await userService.getUser(userId);
        const isAdmin = existingUser.roles.some((role) => role === PermissionRoles.Admin);
        if (isAdmin) {
          throw Boom.badRequest(
            `${PermissionRoles.Admin} ${userId} cannot be assigned to the project ${projectId}`
          );
        }

        // this call is needed to validate that project exists.
        // If not - 404 will be returned
        await projectService.getProject(projectId);

        const groups = await authService.getUserGroups({ userId });

        const isUserAssignedToProject = groups.groupIds.some((id) => id === groupId);
        if (isUserAssignedToProject) {
          throw Boom.badRequest(`User ${userId} is already assigned to the project ${projectId}`);
        }

        await authService.assignUserToGroup({ userId, groupId });
        res.status(204).send();
      } catch (err) {
        if (isUserNotFoundError(err)) {
          throw Boom.notFound(`Could not find user ${userId}`);
        }

        if (Boom.isBoom(err)) {
          throw err;
        }

        throw Boom.badImplementation(`Could not add user ${userId} to the project ${projectId}`);
      }
    })
  );
}
