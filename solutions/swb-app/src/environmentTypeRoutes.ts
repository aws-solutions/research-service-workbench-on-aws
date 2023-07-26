/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { isInvalidPaginationTokenError } from '@aws/workbench-core-base';
import {
  EnvironmentTypeService,
  UpdateEnvironmentTypeRequest,
  UpdateEnvironmentTypeRequestParser,
  ListEnvironmentTypesRequest,
  ListEnvironmentTypesRequestParser,
  GetEnvironmentTypeRequest,
  GetEnvironmentTypeRequestParser
} from '@aws/workbench-core-environments';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpEnvTypeRoutes(router: Router, environmentTypeService: EnvironmentTypeService): void {
  // Get envType
  router.get(
    '/environmentTypes/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetEnvironmentTypeRequest>(GetEnvironmentTypeRequestParser, {
        envTypeId: req.params.id
      });
      const envType = await environmentTypeService.getEnvironmentType(validatedRequest.envTypeId);
      res.status(200).send(envType);
    })
  );

  // Get envTypes
  router.get(
    '/environmentTypes',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<ListEnvironmentTypesRequest>(
        ListEnvironmentTypesRequestParser,
        req.query
      );
      try {
        const envTypes = await environmentTypeService.listEnvironmentTypes(request);
        res.status(200).send(envTypes);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing environment types`);
      }
    })
  );

  // Update envTypes
  router.patch(
    '/environmentTypes/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeRequest = validateAndParse<UpdateEnvironmentTypeRequest>(
        UpdateEnvironmentTypeRequestParser,
        { envTypeId: req.params.id, ...req.body }
      );
      const envType = await environmentTypeService.updateEnvironmentType(envTypeRequest);
      res.status(200).send(envType);
    })
  );
}
