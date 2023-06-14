/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CostCenterService,
  CreateCostCenterRequest,
  CreateCostCenterRequestParser,
  ListCostCentersRequest,
  ListCostCentersRequestParser,
  UpdateCostCenterRequest,
  UpdateCostCenterRequestParser,
  DeleteCostCenterRequest,
  DeleteCostCenterRequestParser,
  ProjectService,
  isInvalidAccountStateError
} from '@aws/workbench-core-accounts';
import { isInvalidPaginationTokenError, validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { wrapAsync } from './errorHandlers';

export function setUpCostCenterRoutes(
  router: Router,
  costCenterService: CostCenterService,
  projectService: ProjectService
): void {
  router.post(
    '/costCenters',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateCostCenterRequest>(
        CreateCostCenterRequestParser,
        req.body
      );

      try {
        res.status(201).send(await costCenterService.create(validatedRequest));
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidAccountStateError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation('There was an error creating the Cost Center');
      }
    })
  );

  router.delete(
    '/costCenters/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const deleteCostCenterRequest = { id: req.params.id };
      const validatedRequest = validateAndParse<DeleteCostCenterRequest>(
        DeleteCostCenterRequestParser,
        deleteCostCenterRequest
      );

      async function checkDependency(costCenterId: string): Promise<void> {
        const costCenterHaveProjects = await projectService.doesCostCenterHaveProjects(costCenterId);
        if (costCenterHaveProjects) {
          throw Boom.conflict(`CostCenter cannot be deleted because it has project(s) associated with it`);
        }
      }
      res.status(204).send(await costCenterService.softDeleteCostCenter(validatedRequest, checkDependency));
    })
  );

  router.patch(
    '/costCenters/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const updateCostCenterRequest = { id: req.params.id, ...req.body };
      const validatedRequest = validateAndParse<UpdateCostCenterRequest>(
        UpdateCostCenterRequestParser,
        updateCostCenterRequest
      );
      res.status(200).send(await costCenterService.updateCostCenter(validatedRequest));
    })
  );

  router.get(
    '/costCenters/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedData = z.string().costCenterId().safeParse(req.params.id);
      if (!validatedData.success) {
        throw Boom.notFound();
      }

      res.status(200).send(await costCenterService.getCostCenter(validatedData.data));
    })
  );

  router.get(
    '/costCenters',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListCostCentersRequest>(
        ListCostCentersRequestParser,
        req.query
      );
      try {
        res.status(200).send(await costCenterService.listCostCenters(validatedRequest));
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing cost centers`);
      }
    })
  );
}
