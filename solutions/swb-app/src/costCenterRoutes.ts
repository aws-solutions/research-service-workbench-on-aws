/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import {
  CreateCostCenterRequest,
  CreateCostCenterRequestParser
} from './accounts/models/costCenters/createCostCenterRequest';
import {
  DeleteCostCenterRequest,
  DeleteCostCenterRequestParser
} from './accounts/models/costCenters/deleteCostCenterRequest';
import {
  ListCostCentersRequest,
  ListCostCentersRequestParser
} from './accounts/models/costCenters/listCostCentersRequest';
import {
  UpdateCostCenterRequest,
  UpdateCostCenterRequestParser
} from './accounts/models/costCenters/updateCostCenterRequest';
import CostCenterService from './accounts/services/costCenterService';
import ProjectService from './accounts/services/projectService';
import { isInvalidPaginationTokenError } from './base/errors/invalidPaginationTokenError';
import { validateAndParse } from './base/utilities/validatorHelper';
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
