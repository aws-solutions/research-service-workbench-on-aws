/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EnvironmentService,
  isEnvironmentStatus,
  isSortAttribute,
  CreateEnvironmentSchema
} from '@amzn/workbench-core-environments';
import Boom from '@hapi/boom';
import { NextFunction, Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import _ from 'lodash';
import { Environment } from './apiRouteConfig';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpEnvRoutes(
  router: Router,
  environments: { [key: string]: Environment },
  environmentService: EnvironmentService
): void {
  const supportedEnvs = Object.keys(environments);

  // Launch
  router.post(
    '/environments',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateEnvironmentSchema));
      const envType = req.body.envType;
      if (supportedEnvs.includes(envType)) {
        if (req.body.id) {
          throw Boom.badRequest(
            'id cannot be passed in the request body when trying to launch a new environment'
          );
        }
        const env = await environmentService.createEnvironment(req.body, res.locals.user);
        try {
          // We check that envType is in list of supportedEnvs before calling the environments object
          //eslint-disable-next-line security/detect-object-injection
          await environments[envType].lifecycle.launch(env);
        } catch (e) {
          // Update error state
          const errorMessage = e.message as string;
          await environmentService.updateEnvironment(env.id!, {
            error: { type: 'LAUNCH', value: errorMessage },
            status: 'FAILED'
          });
          throw e;
        }
        res.status(201).send(env);
      } else {
        throw Boom.badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Terminate
  router.put(
    '/environments/:id/terminate',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await environmentService.getEnvironment(req.params.id, true);
      const envType = environment.ETC.type;
      const envStatus = environment.status;
      if (['TERMINATING', 'TERMINATED'].includes(envStatus)) {
        res.status(204).send();
      } else if (envStatus === 'TERMINATING_FAILED') {
        throw Boom.conflict(
          'Environment cannot be terminated, environment is already in TERMINATING_FAILED state'
        );
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        //eslint-disable-next-line security/detect-object-injection
        await environments[envType].lifecycle.terminate(req.params.id);
        res.status(204).send();
      } else {
        throw Boom.badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Start
  router.put(
    '/environments/:id/start',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await environmentService.getEnvironment(req.params.id, true);
      const envType = environment.ETC.type;
      if (environment.status === 'STOPPING') {
        throw Boom.conflict('Cannot start environment while environment is currently being stopped');
      } else if (['STARTING', 'PENDING', 'COMPLETED'].includes(environment.status)) {
        res.status(204).send();
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        //eslint-disable-next-line security/detect-object-injection
        await environments[envType].lifecycle.start(req.params.id);
        res.status(204).send();
      } else {
        throw Boom.badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Stop
  router.put(
    '/environments/:id/stop',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await environmentService.getEnvironment(req.params.id, true);
      const envType = environment.ETC.type;

      if (['PENDING', 'STARTING'].includes(environment.status)) {
        throw Boom.conflict('Cannot stop environment while environment is currently being started');
      } else if (['STOPPING', 'STOPPED'].includes(environment.status)) {
        res.status(204).send();
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        //eslint-disable-next-line security/detect-object-injection
        await environments[envType].lifecycle.stop(req.params.id);
        res.status(204).send();
      } else {
        throw Boom.badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Get environment connection creds
  router.get(
    '/environments/:id/connections',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await environmentService.getEnvironment(req.params.id, true);
      const instanceName = environment.instanceId!;
      const envType = environment.ETC.type;

      const context = {
        roleArn: environment.PROJ.envMgmtRoleArn,
        externalId: environment.PROJ.externalId
      };

      if (environment.status !== 'COMPLETED') {
        throw Boom.conflict(
          `Environment is in ${environment.status} status. Please wait until environment is in 'COMPLETED' status before trying to connect to the environment.`
        );
      }
      if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        // eslint-disable-next-line security/detect-object-injection
        const authCredResponse = await environments[envType].connection.getAuthCreds(instanceName, context);
        // We check that envType is in list of supportedEnvs before calling the environments object
        // eslint-disable-next-line security/detect-object-injection
        const instructionResponse = await environments[envType].connection.getConnectionInstruction();
        const response = {
          authCredResponse,
          instructionResponse
        };
        res.send(response);
      } else {
        throw Boom.badRequest(
          `No service provided for environment ${envType}. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Get environment
  router.get(
    '/environments/:id',
    wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
      const env = await environmentService.getEnvironment(req.params.id, true);
      res.send(env);
    })
  );

  // Get environments
  router.get(
    '/environments',
    wrapAsync(async (req: Request, res: Response) => {
      const {
        status,
        name,
        createdAtFrom,
        createdAtTo,
        owner,
        type,
        project,
        paginationToken,
        pageSize,
        ascending,
        descending
      } = req.query;
      // Apply filter if applicable
      let filter: { [key: string]: string } | undefined = {};
      if (status && isEnvironmentStatus(status)) {
        filter = { ...filter, status };
      }
      if (name && typeof name === 'string') {
        filter = { ...filter, name };
      }
      if (createdAtFrom && typeof createdAtFrom === 'string') {
        filter = { ...filter, createdAtFrom };
      }
      if (createdAtTo && typeof createdAtTo === 'string') {
        filter = { ...filter, createdAtTo };
      }
      if (owner && typeof owner === 'string') {
        filter = { ...filter, owner };
      }
      if (type && typeof type === 'string') {
        filter = { ...filter, type };
      }
      if (project && typeof project === 'string') {
        filter = { ...filter, project };
      }
      if (_.isEmpty(filter)) {
        filter = undefined;
      }
      // Apply sort if applicable
      let sort: { [key: string]: boolean } | undefined = {};
      if (ascending && isSortAttribute(ascending)) {
        sort[`${ascending}`] = true;
      } else if (descending && isSortAttribute(descending)) {
        sort[`${descending}`] = false;
      }
      if (_.isEmpty(sort)) {
        sort = undefined;
      }
      // Apply pagination if applicable
      if ((paginationToken && typeof paginationToken !== 'string') || (pageSize && Number(pageSize) <= 0)) {
        throw Boom.badRequest(
          'Invalid pagination token and/or page size. Please try again with valid inputs.'
        );
      } else if (status && !isEnvironmentStatus(status)) {
        throw Boom.badRequest('Invalid environment status. Please try again with valid inputs.');
      } else if ((ascending && !isSortAttribute(ascending)) || (descending && !isSortAttribute(descending))) {
        throw Boom.badRequest('Invalid sort attribute. Please try again with valid inputs.');
      } else if (ascending && descending) {
        throw Boom.badRequest('Cannot sort on two attributes. Please try again with valid inputs.');
      } else if ((createdAtFrom && !createdAtTo) || (!createdAtFrom && createdAtTo)) {
        throw Boom.badRequest(
          `Invalid value for attribute ${createdAtTo ? 'createdAtTo' : 'createdAtFrom'}.`
        );
      } else {
        const response = await environmentService.listEnvironments(
          res.locals.user,
          filter,
          pageSize ? Number(pageSize) : undefined,
          paginationToken,
          sort
        );
        res.send(response);
      }
    })
  );
}
