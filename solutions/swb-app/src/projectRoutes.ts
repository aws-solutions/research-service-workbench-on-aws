/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectService } from '@aws/workbench-core-accounts';
import CreateProjectSchema from '@aws/workbench-core-accounts/lib/schemas/createProjectSchema';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpProjectRoutes(router: Router, projectService: ProjectService): void {
  // Get projects
  router.get(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      const projects = await projectService.listProjects();
      res.send(projects);
    })
  );

  // Create project
  router.post(
    '/projects',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateProjectSchema));
      res.send(await projectService.createProject({ ...req.body }, res.locals.user));
    })
  );
}
