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
  ProjectService
} from '@aws/workbench-core-accounts';
import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
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
      res.status(201).send(await costCenterService.create(validatedRequest));
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
          throw Boom.conflict(
            `CostCenter ${costCenterId} cannot be deleted because it has project(s) associated with it`
          );
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
      res.status(200).send(await costCenterService.getCostCenter(req.params.id));
    })
  );

  router.get(
    '/costCenters',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListCostCentersRequest>(
        ListCostCentersRequestParser,
        req.query
      );
      res.status(200).send(await costCenterService.listCostCenters(validatedRequest));
    })
  );
}
