/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey } from '@aws/workbench-core-base';
import {
  Environment,
  EnvironmentService,
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
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpEnvTypeConfigRoutes(
  router: Router,
  environmentTypeConfigService: EnvironmentTypeConfigService,
  environmentService: EnvironmentService
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

      async function checkDependency(envTypeId: string, envTypeConfigId: string): Promise<void> {
        const typeId = `${resourceTypeToKey.envType}#${envTypeId}${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`;
        let paginationToken: string | undefined = undefined;

        do {
          const dependencies: { data: Environment[]; paginationToken: string | undefined } =
            await environmentService.listEnvironments(
              res.locals.user,
              { type: typeId },
              200,
              paginationToken
            );
          if (dependencies?.data) {
            const conflicEnvironments = dependencies.data.filter((e) => e.status !== 'FAILED');
            if (conflicEnvironments.length > 0) {
              const conflicSummary = conflicEnvironments
                .map((e) => `Environment:'${e.id}' Status:'${e.status}'`)
                .join('\n');
              throw Boom.conflict(
                `There are active environments using this configuration: ${conflicSummary}. Please Terminate environments or wait until environments are in 'TERMINATED' status before trying to delete configuration.`
              );
            }
            paginationToken = dependencies.paginationToken;
          }
        } while (paginationToken !== undefined);
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
