/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateEnvironmentTypeConfigSchema,
  EnvironmentTypeConfigService,
  UpdateEnvironmentTypeConfigSchema
} from '@amzn/workbench-core-environments';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { validate as uuidValidate } from 'uuid';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpEnvTypeConfigRoutes(
  router: Router,
  environmentTypeConfigService: EnvironmentTypeConfigService
): void {
  // Create envTypeConfig
  router.post(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.envTypeId)) {
        throw Boom.badRequest('envTypeId request parameter must be a valid uuid.');
      }
      processValidatorResult(validate(req.body, CreateEnvironmentTypeConfigSchema));
      const user = res.locals.user;
      const envTypeConfig = await environmentTypeConfigService.createNewEnvironmentTypeConfig(
        user.id,
        req.params.envTypeId,
        req.body
      );
      res.status(201).send(envTypeConfig);
    })
  );

  // Get envTypeConfig
  router.get(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.envTypeId)) {
        throw Boom.badRequest('envTypeId request parameter must be a valid uuid.');
      }

      if (!uuidValidate(req.params.envTypeConfigId)) {
        throw Boom.badRequest('envTypeConfigId request parameter must be a valid uuid.');
      }
      const envTypeConfig = await environmentTypeConfigService.getEnvironmentTypeConfig(
        req.params.envTypeId,
        req.params.envTypeConfigId
      );
      res.send(envTypeConfig);
    })
  );

  // Get envTypeConfigs
  router.get(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.envTypeId)) {
        throw Boom.badRequest('envTypeId request parameter must be a valid uuid.');
      }
      const { paginationToken, pageSize } = req.query;
      if ((paginationToken && typeof paginationToken !== 'string') || (pageSize && Number(pageSize) <= 0)) {
        res
          .status(400)
          .send('Invalid pagination token and/or page size. Please try again with valid inputs.');
      } else {
        const envTypeConfig = await environmentTypeConfigService.listEnvironmentTypeConfigs(
          req.params.envTypeId,
          pageSize ? Number(pageSize) : undefined,
          paginationToken
        );
        res.send(envTypeConfig);
      }
    })
  );

  // Update envTypeConfig
  router.put(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      if (!uuidValidate(req.params.envTypeId)) {
        throw Boom.badRequest('envTypeId request parameter must be a valid uuid.');
      }

      if (!uuidValidate(req.params.envTypeConfigId)) {
        throw Boom.badRequest('envTypeConfigId request parameter must be a valid uuid.');
      }

      processValidatorResult(validate(req.body, UpdateEnvironmentTypeConfigSchema));
      const user = res.locals.user;
      const envTypeConfig = await environmentTypeConfigService.updateEnvironmentTypeConfig(
        user.id,
        req.params.envTypeId,
        req.params.envTypeConfigId,
        req.body
      );
      res.status(200).send(envTypeConfig);
    })
  );
}
