/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  ProjectService,
  CreateProjectRequest,
  ListProjectsRequest,
  ListProjectsRequestParser,
  GetProjectRequest
} from '@aws/workbench-core-accounts';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { wrapAsync } from './errorHandlers';
import CreateProjectSchema from './schemas/projects/createProjectSchema';
import GetProjectSchema from './schemas/projects/getProjectSchema';
import { processValidatorResult, validateAndParse } from './validatorHelper';

export function setUpProjectRoutes(router: Router, projectService: ProjectService): void {
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
      const validatedRequest = validateAndParse<ListProjectsRequest>(ListProjectsRequestParser, req.query);

      res.send(await projectService.listProjects(validatedRequest));
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
}
