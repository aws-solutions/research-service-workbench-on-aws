/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { isInvalidPaginationTokenError } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import {
  CreateEnvironmentTypeConfigRequest,
  CreateEnvironmentTypeConfigRequestParser
} from './envTypeConfigs/createEnvironmentTypeConfigRequest';
import {
  DeleteEnvironmentTypeConfigRequest,
  DeleteEnvironmentTypeConfigRequestParser
} from './envTypeConfigs/deleteEnvironmentTypeConfigRequest';
import { EnvTypeConfigPlugin } from './envTypeConfigs/envTypeConfigPlugin';
import {
  GetEnvironmentTypeConfigRequest,
  GetEnvironmentTypeConfigRequestParser
} from './envTypeConfigs/getEnvironmentTypeConfigRequest';
import {
  ListEnvironmentTypeConfigsRequest,
  ListEnvironmentTypeConfigsRequestParser
} from './envTypeConfigs/listEnvironmentTypeConfigsRequest';
import {
  UpdateEnvironmentTypeConfigRequest,
  UpdateEnvironmentTypeConfigRequestParser
} from './envTypeConfigs/updateEnvironmentTypeConfigsRequest';
import { wrapAsync } from './errorHandlers';
import { isConflictError } from './errors/conflictError';
import { validateAndParse } from './validatorHelper';

export function setUpEnvTypeConfigRoutes(
  router: Router,
  environmentTypeConfigService: EnvTypeConfigPlugin
): void {
  // Create envTypeConfig
  router.post(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeConfigRequest = validateAndParse<CreateEnvironmentTypeConfigRequest>(
        CreateEnvironmentTypeConfigRequestParser,
        { envTypeId: req.params.envTypeId, ...req.body }
      );
      const envTypeConfig = await environmentTypeConfigService.createEnvTypeConfig(envTypeConfigRequest);
      res.status(201).send(envTypeConfig);
    })
  );

  // Get envTypeConfig
  router.get(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeConfigRequest = validateAndParse<GetEnvironmentTypeConfigRequest>(
        GetEnvironmentTypeConfigRequestParser,
        { envTypeId: req.params.envTypeId, envTypeConfigId: req.params.envTypeConfigId }
      );
      const envTypeConfig = await environmentTypeConfigService.getEnvTypeConfig(envTypeConfigRequest);
      res.status(200).send(envTypeConfig);
    })
  );

  // Soft Delete envTypeConfig
  router.delete(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeConfigDeleteRequest = {
        envTypeId: req.params.envTypeId,
        envTypeConfigId: req.params.envTypeConfigId
      };
      const validatedRequest = validateAndParse<DeleteEnvironmentTypeConfigRequest>(
        DeleteEnvironmentTypeConfigRequestParser,
        envTypeConfigDeleteRequest
      );
      try {
        const envTypeConfig = await environmentTypeConfigService.deleteEnvTypeConfig(validatedRequest);
        res.status(204).send(envTypeConfig);
      } catch (e) {
        if (isConflictError(e)) {
          throw Boom.conflict(e.message);
        }
        throw e;
      }
    })
  );

  // Get envTypeConfigs
  router.get(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      const listEnvTypeConfigRequest = validateAndParse<ListEnvironmentTypeConfigsRequest>(
        ListEnvironmentTypeConfigsRequestParser,
        { envTypeId: req.params.envTypeId, ...req.query }
      );

      try {
        const envTypeConfig = await environmentTypeConfigService.listEnvTypeConfigs(listEnvTypeConfigRequest);
        res.status(200).send(envTypeConfig);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing configurations for environment type`);
      }
    })
  );

  // Update envTypeConfig
  router.patch(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeConfigRequest = validateAndParse<UpdateEnvironmentTypeConfigRequest>(
        UpdateEnvironmentTypeConfigRequestParser,
        { envTypeId: req.params.envTypeId, envTypeConfigId: req.params.envTypeConfigId, ...req.body }
      );
      const envTypeConfig = await environmentTypeConfigService.updateEnvTypeConfig(envTypeConfigRequest);
      res.status(200).send(envTypeConfig);
    })
  );
}
