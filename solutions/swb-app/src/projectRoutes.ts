/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectService, CreateProjectRequest, ListProjectsRequest } from '@aws/workbench-core-accounts';
import Boom from '@hapi/boom';
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
      let projects = {};
      // validate if query params present
      if (req.query.pageSize || req.query.paginationToken) {
        const objectToValidate = {
          pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
          paginationToken: req.query.paginationToken
        };
        processValidatorResult(validate(objectToValidate, ListProjectsSchema));
        // Apply pagination if applicable
        if (
          (objectToValidate.paginationToken && typeof objectToValidate.paginationToken !== 'string') ||
          (objectToValidate.pageSize && Number(objectToValidate.pageSize) <= 0)
        ) {
          throw Boom.badRequest(
            'Invalid pagination token and/or page size. Please try again with valid inputs.'
          );
        }
        const request: ListProjectsRequest = objectToValidate as ListProjectsRequest;

        projects = await projectService.listProjects(res.locals.user, request);
      } else {
        projects = await projectService.listProjects(res.locals.user);
      }

      res.send(projects);
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
