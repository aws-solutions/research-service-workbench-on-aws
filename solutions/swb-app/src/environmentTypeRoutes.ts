/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateEnvironmentTypeSchema,
  EnvironmentTypeService,
  isEnvironmentTypeStatus,
  ENVIRONMENT_TYPE_STATUS,
  UpdateEnvironmentTypeSchema
} from '@amzn/workbench-core-environments';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { validate as uuidValidate } from 'uuid';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpEnvTypeRoutes(router: Router, environmentTypeService: EnvironmentTypeService): void {
  // Create envType
  router.post(
    '/environmentTypes',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateEnvironmentTypeSchema));
      const { status } = req.body;

      if (!isEnvironmentTypeStatus(status)) {
        throw Boom.badRequest(
          `Status provided is: ${status}. Status needs to be one of these values: ${ENVIRONMENT_TYPE_STATUS}`
        );
      }
      const user = res.locals.user;
      const envType = await environmentTypeService.createNewEnvironmentType(user.id, {
        ...req.body
      });
      res.status(201).send(envType);
    })
  );

  // Get envType
  router.get(
    '/environmentTypes/:id',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.id)) {
        throw Boom.badRequest('id request parameter must be a valid uuid.');
      }
      const envType = await environmentTypeService.getEnvironmentType(req.params.id);
      res.send(envType);
    })
  );

  // Get envTypes
  router.get(
    '/environmentTypes',
    wrapAsync(async (req: Request, res: Response) => {
      const { paginationToken, pageSize } = req.query;
      if ((paginationToken && typeof paginationToken !== 'string') || (pageSize && Number(pageSize) <= 0)) {
        res
          .status(400)
          .send('Invalid pagination token and/or page size. Please try again with valid inputs.');
      } else {
        const envType = await environmentTypeService.listEnvironmentTypes(
          pageSize ? Number(pageSize) : undefined,
          paginationToken
        );
        res.send(envType);
      }
    })
  );

  // Update envTypes
  router.put(
    '/environmentTypes/:id',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.id)) {
        throw Boom.badRequest('id request parameter must be a valid uuid.');
      }
      processValidatorResult(validate(req.body, UpdateEnvironmentTypeSchema));
      const user = res.locals.user;
      const { status } = req.body;
      if (!isEnvironmentTypeStatus(status)) {
        throw Boom.badRequest(
          `Status provided is: ${status}. Status needs to be one of these values: ${ENVIRONMENT_TYPE_STATUS}`
        );
      }
      const envType = await environmentTypeService.updateEnvironmentType(user.id, req.params.id, req.body);
      res.status(200).send(envType);
    })
  );
}
