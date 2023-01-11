/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  ProjectService,
  CreateProjectRequest,
  ListProjectsRequest,
  ListProjectsRequestParser,
  GetProjectRequest,
  DeleteProjectRequest,
  DeleteProjectRequestParser
} from '@aws/workbench-core-accounts';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { validateAndParse, MetadataService, resourceTypeToKey } from '@aws/workbench-core-base';
import { EnvironmentService } from '@aws/workbench-core-environments';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { wrapAsync } from './errorHandlers';
import CreateProjectSchema from './schemas/projects/createProjectSchema';
import GetProjectSchema from './schemas/projects/getProjectSchema';
import ListProjectsSchema from './schemas/projects/listProjectsSchema';
import {
  ProjectDatasetMetadata,
  ProjectDatasetMetadataParser,
  ProjectEnvTypeConfigMetadata,
  ProjectEnvTypeConfigMetadataParser
} from './schemas/projects/projectMetadataParser';
import { processValidatorResult } from './validatorHelper';

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
      const objectToValidate = {
        user: res.locals.user as AuthenticatedUser,
        projectId: req.params.projectId
      };
      processValidatorResult(validate(objectToValidate, GetProjectSchema));
      const request: GetProjectRequest = objectToValidate as GetProjectRequest;

      res.send(await projectService.getProject(request));
    })
  );

  // List projects
  router.get(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const objectToValidate = {
        user: res.locals.user as AuthenticatedUser,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        paginationToken: req.query.paginationToken,
        filter: req.query.filter,
        sort: req.query.sort
      };
      processValidatorResult(validate(objectToValidate, ListProjectsSchema));
      const request: ListProjectsRequest = objectToValidate as ListProjectsRequest;

      res.send(await projectService.listProjects(request));
    })
  );

  // Create project
  router.post(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateProjectSchema));
      const request: CreateProjectRequest = {
        name: req.body.name,
        description: req.body.description,
        costCenterId: req.body.costCenterId
      };
      res.send(await projectService.createProject(request, res.locals.user));
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
        ...req.params
      });
      // delete project
      await projectService.softDeleteProject(validatedRequest, checkDependencies);
      res.status(204).send();
    })
  );
}
