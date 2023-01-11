/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EnvironmentTypeService,
  UpdateEnvironmentTypeRequest,
  UpdateEnvironmentTypeRequestParser,
  ListEnvironmentTypesRequest,
  ListEnvironmentTypesRequestParser
} from '@aws/workbench-core-environments';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpEnvTypeRoutes(router: Router, environmentTypeService: EnvironmentTypeService): void {
  // Get envType
  router.get(
    '/environmentTypes/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const envType = await environmentTypeService.getEnvironmentType(req.params.id);
      res.send(envType);
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
      const envTypes = await environmentTypeService.listEnvironmentTypes(request);
      res.send(envTypes);
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
