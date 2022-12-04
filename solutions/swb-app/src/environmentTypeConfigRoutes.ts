/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EnvironmentTypeConfigService,
  DeleteEnvironmentTypeConfigRequest,
  DeleteEnvironmentTypeConfigRequestParser,
  CreateEnvironmentTypeConfigRequest,
  UpdateEnvironmentTypeConfigRequest,
  ListEnvironmentTypeConfigsRequest,
  CreateEnvironmentTypeConfigRequestParser,
  UpdateEnvironmentTypeConfigRequestParser,
  ListEnvironmentTypeConfigsRequestParser
} from '@aws/workbench-core-environments';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpEnvTypeConfigRoutes(
  router: Router,
  environmentTypeConfigService: EnvironmentTypeConfigService
): void {
  // Create envTypeConfig
  router.post(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeConfigRequest = validateAndParse<CreateEnvironmentTypeConfigRequest>(
        CreateEnvironmentTypeConfigRequestParser,
        { envTypeId: req.params.envTypeId, ...req.body }
      );
      const envTypeConfig = await environmentTypeConfigService.createNewEnvironmentTypeConfig(
        envTypeConfigRequest
      );
      res.status(201).send(envTypeConfig);
    })
  );

  // Get envTypeConfig
  router.get(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeConfig = await environmentTypeConfigService.getEnvironmentTypeConfig(
        req.params.envTypeId,
        req.params.envTypeConfigId
      );
      res.send(envTypeConfig);
    })
  );

  // Soft Delete envTypeConfig
  router.put(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId/softDelete',
    wrapAsync(async (req: Request, res: Response) => {
      const envTypeConfigDeleteRequest = {
        envTypeId: req.params.envTypeId,
        envTypeConfigId: req.params.envTypeConfigId
      };
      const validatedRequest = validateAndParse<DeleteEnvironmentTypeConfigRequest>(
        DeleteEnvironmentTypeConfigRequestParser,
        envTypeConfigDeleteRequest
      );

      async function checkDependency(envTypeId: string, envTypeConfigId: string): Promise<void> {
        // TODO: Implement this using metadataService
        return Promise.resolve();
      }
      const envTypeConfig = await environmentTypeConfigService.softDeleteEnvironmentTypeConfig(
        validatedRequest,
        checkDependency
      );
      res.send(envTypeConfig);
    })
  );

  // Get envTypeConfigs
  router.get(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      const listEnvTypeConfigRequest = validateAndParse<ListEnvironmentTypeConfigsRequest>(
        ListEnvironmentTypeConfigsRequestParser,
        { envTypeId: req.params.envTypeId, ...req.body }
      );

      const envTypeConfig = await environmentTypeConfigService.listEnvironmentTypeConfigs(
        listEnvTypeConfigRequest
      );
      res.send(envTypeConfig);
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
      const envTypeConfig = await environmentTypeConfigService.updateEnvironmentTypeConfig(
        envTypeConfigRequest
      );
      res.status(200).send(envTypeConfig);
    })
  );
}
