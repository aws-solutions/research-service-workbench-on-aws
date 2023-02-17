/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateEnvironmentSchema, Environment } from '@aws/workbench-core-environments';
import { badRequest, conflict } from '@hapi/boom';
import { NextFunction, Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { EnvironmentUtilityServices } from './apiRouteConfig';
import { wrapAsync } from './errorHandlers';
import { ProjectEnvPlugin } from './projectEnvs/projectEnvPlugin';
import { processValidatorResult } from './validatorHelper';

export function setUpProjectEnvRoutes(
  router: Router,
  environments: { [key: string]: EnvironmentUtilityServices },
  projectEnvironmentService: ProjectEnvPlugin
): void {
  const supportedEnvs = Object.keys(environments);

  // Launch
  router.post(
    '/projects/:projectId/environments',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateEnvironmentSchema));
      const envType = req.body.envType;
      req.body.projectId = req.params.projectId;
      if (supportedEnvs.includes(envType)) {
        if (req.body.id) {
          throw badRequest('id cannot be passed in the request body when trying to launch a new environment');
        }
        const env: Environment = await projectEnvironmentService.createEnvironment(req.body, res.locals.user);
        try {
          // We check that envType is in list of supportedEnvs before calling the environments object
          await environments[`${envType}`].lifecycle.launch(env);
        } catch (e) {
          // Update error state
          const errorMessage = e.message as string;
          await projectEnvironmentService.updateEnvironment(env.projectId, env.id!, {
            error: { type: 'LAUNCH', value: errorMessage },
            status: 'FAILED'
          });
          throw e;
        }
        res.status(201).send(env);
      } else {
        throw badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Terminate
  router.put(
    '/projects/:projectId/environments/:id/terminate',
    wrapAsync(async (req: Request, res: Response) => {
      const environment: Environment = await projectEnvironmentService.getEnvironment(
        req.params.projectId,
        req.params.id,
        true
      );
      const envType = environment.ETC.type;
      const envStatus = environment.status;
      if (['TERMINATING', 'TERMINATED'].includes(envStatus)) {
        res.status(204).send();
      } else if (envStatus === 'TERMINATING_FAILED') {
        throw conflict(
          'Environment cannot be terminated, environment is already in TERMINATING_FAILED state'
        );
      } else if (envStatus !== 'STOPPED') {
        throw badRequest(
          `Environment must be STOPPED before beginning termination. ${environment.id} currently in state ${environment.status}.`
        );
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        await environments[`${envType}`].lifecycle.terminate(req.params.id);
        res.status(204).send();
      } else {
        throw badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Start
  router.put(
    '/projects/:projectId/environments/:id/start',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await projectEnvironmentService.getEnvironment(
        req.params.projectId,
        req.params.id,
        true
      );
      const envType = environment.ETC.type;
      if (environment.status === 'STOPPING') {
        throw conflict('Cannot start environment while environment is currently being stopped');
      } else if (['STARTING', 'PENDING', 'COMPLETED'].includes(environment.status)) {
        res.status(204).send();
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        await environments[`${envType}`].lifecycle.start(req.params.id);
        res.status(204).send();
      } else {
        throw badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Stop
  router.put(
    '/projects/:projectId/environments/:id/stop',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await projectEnvironmentService.getEnvironment(
        req.params.projectId,
        req.params.id,
        true
      );
      const envType = environment.ETC.type;

      if (['PENDING', 'STARTING'].includes(environment.status)) {
        throw conflict('Cannot stop environment while environment is currently being started');
      } else if (['STOPPING', 'STOPPED'].includes(environment.status)) {
        res.status(204).send();
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        await environments[`${envType}`].lifecycle.stop(req.params.id);
        res.status(204).send();
      } else {
        throw badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Get environment connection creds
  router.get(
    '/projects/:projectId/environments/:id/connections',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await projectEnvironmentService.getEnvironment(
        req.params.projectId,
        req.params.id,
        true
      );
      const instanceName = environment.instanceId!;
      const envType = environment.ETC.type;

      const context = {
        roleArn: environment.PROJ.envMgmtRoleArn,
        externalId: environment.PROJ.externalId
      };

      if (environment.status !== 'COMPLETED') {
        throw conflict(
          `Environment is in ${environment.status} status. Please wait until environment is in 'COMPLETED' status before trying to connect to the environment.`
        );
      }
      if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        const authCredResponse = await environments[`${envType}`].connection.getAuthCreds(
          instanceName,
          context
        );
        // We check that envType is in list of supportedEnvs before calling the environments object
        const instructionResponse = await environments[`${envType}`].connection.getConnectionInstruction();
        const response = {
          authCredResponse,
          instructionResponse
        };
        res.send(response);
      } else {
        throw badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Get environment
  router.get(
    '/projects/:projectId/environments/:id',
    wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
      const env = await projectEnvironmentService.getEnvironment(req.params.projectId, req.params.id, true);
      res.send(env);
    })
  );

  // List project environments
  router.get(
    '/projects/:projectId/environments',
    wrapAsync(async (req: Request, res: Response) => {
      const { paginationToken, pageSize } = req.query;
      // Apply pagination if applicable
      if ((paginationToken && typeof paginationToken !== 'string') || (pageSize && Number(pageSize) <= 0)) {
        throw badRequest('Invalid pagination token and/or page size. Please try again with valid inputs.');
      } else {
        const response = await projectEnvironmentService.listProjectEnvs(
          req.params.projectId,
          res.locals.user,
          pageSize ? Number(pageSize) : undefined,
          paginationToken
        );
        res.send(response);
      }
    })
  );
}
