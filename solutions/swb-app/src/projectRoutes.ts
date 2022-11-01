/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectService, CreateProjectRequest, ListProjectsRequest } from '@aws/workbench-core-accounts';
import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { wrapAsync } from './errorHandlers';
import CreateProjectSchema from './schemas/projects/createProjectSchema';
import ListProjectsSchema from './schemas/projects/listProjectsSchema';
import { processValidatorResult } from './validatorHelper';

export function setUpProjectRoutes(router: Router, projectService: ProjectService): void {
  // List projects
  router.get(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const objectToValidate = {
        user: res.locals.user as AuthenticatedUser,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        paginationToken: req.query.paginationToken
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
}
