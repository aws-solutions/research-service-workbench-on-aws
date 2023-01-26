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
  DeleteProjectRequestParser
} from '@aws/workbench-core-accounts';
import { validateAndParse, MetadataService, resourceTypeToKey } from '@aws/workbench-core-base';
import { EnvironmentService } from '@aws/workbench-core-environments';
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
  metadataService: MetadataService
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
}
