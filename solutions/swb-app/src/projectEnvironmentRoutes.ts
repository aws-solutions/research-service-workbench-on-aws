/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { isInvalidPaginationTokenError } from '@aws/workbench-core-base';
import { Environment } from '@aws/workbench-core-environments';
import * as Boom from '@hapi/boom';
import { NextFunction, Request, Response, Router } from 'express';
import { EnvironmentUtilityServices } from './apiRouteConfig';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { wrapAsync } from './errorHandlers';
import { isProjectDeletedError } from './errors/projectDeletedError';
import {
  ConnectEnvironmentRequest,
  ConnectEnvironmentRequestParser
} from './projectEnvs/connectEnvironmentRequest';
import {
  CreateEnvironmentRequest,
  CreateEnvironmentRequestParser
} from './projectEnvs/createEnvironmentRequest';
import { GetEnvironmentRequest, GetEnvironmentRequestParser } from './projectEnvs/getEnvironmentRequest';
import {
  ListProjectEnvironmentsRequest,
  ListProjectEnvironmentsRequestParser
} from './projectEnvs/listProjectEnvironmentsRequest';
import { ProjectEnvPlugin } from './projectEnvs/projectEnvPlugin';
import {
  StartEnvironmentRequest,
  StartEnvironmentRequestParser
} from './projectEnvs/startEnvironmentRequest';
import { StopEnvironmentRequest, StopEnvironmentRequestParser } from './projectEnvs/stopEnvironmentRequest';
import {
  TerminateEnvironmentRequest,
  TerminateEnvironmentRequestParser
} from './projectEnvs/terminateEnvironmentRequest';
import { validateAndParse } from './validatorHelper';

export function setUpProjectEnvRoutes(
  router: Router,
  environments: { [key: string]: EnvironmentUtilityServices },
  projectEnvironmentService: ProjectEnvPlugin,
  datasetService: DataSetPlugin
): void {
  const supportedEnvs = Object.keys(environments);

  // Launch
  router.post(
    '/projects/:projectId/environments',
    wrapAsync(async (req: Request, res: Response) => {
      const environmentRequest = validateAndParse<CreateEnvironmentRequest>(CreateEnvironmentRequestParser, {
        ...req.body,
        projectId: req.params.projectId
      });
      const { envType } = environmentRequest;

      if (!supportedEnvs.includes(envType)) {
        throw Boom.badRequest(
          `No service provided for environment. Supported environments types are: ${supportedEnvs}`
        );
      }
      if (req.body.id) {
        throw Boom.badRequest(
          'id cannot be passed in the request body when trying to launch a new environment'
        );
      }

      const authorizedDatasets = await datasetService.isProjectAuthorizedForDatasets({
        authenticatedUser: res.locals.user,
        datasetIds: environmentRequest.datasetIds,
        projectId: req.params.projectId
      });
      if (!authorizedDatasets) {
        throw Boom.forbidden(`Project does not have access to the provided dataset(s)`);
      }

      let env: Environment;
      try {
        env = await projectEnvironmentService.createEnvironment(environmentRequest, res.locals.user);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }
        if (isProjectDeletedError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem creating environment for project`);
      }
      try {
        // We check that envType is in list of supportedEnvs before calling the environments object
        await environments[`${envType}`].lifecycle.launch(env);

        res.status(201).send(env);
      } catch (e) {
        // Update error state
        const errorMessage = e.message as string;
        await projectEnvironmentService.updateEnvironment(env.projectId, env.id!, {
          error: { type: 'LAUNCH', value: errorMessage },
          status: 'FAILED'
        });
        if (Boom.isBoom(e)) {
          throw e;
        }
        throw Boom.badImplementation(e.message);
      }
    })
  );

  // Terminate
  router.put(
    '/projects/:projectId/environments/:id/terminate',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<TerminateEnvironmentRequest>(
        TerminateEnvironmentRequestParser,
        { environmentId: req.params.id, projectId: req.params.projectId }
      );
      const { environmentId, projectId } = validatedRequest;
      const environment: Environment = await projectEnvironmentService.getEnvironment(
        projectId,
        environmentId,
        true
      );
      const envType = environment.ETC!.type;
      const envStatus = environment.status;
      if (['TERMINATING', 'TERMINATED'].includes(envStatus)) {
        res.status(204).send();
      } else if (envStatus === 'TERMINATING_FAILED') {
        throw Boom.conflict(
          'Environment cannot be terminated, environment is already in TERMINATING_FAILED state'
        );
      } else if (!['STOPPED', 'FAILED'].includes(envStatus)) {
        throw Boom.badRequest(
          `Environment must be in state STOPPED or FAILED before beginning termination. Environment currently in state ${envStatus}.`
        );
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        await environments[`${envType}`].lifecycle.terminate(environmentId);
        res.status(204).send();
      } else {
        throw Boom.badRequest(
          `No service provided for environment. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Start
  router.put(
    '/projects/:projectId/environments/:id/start',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<StartEnvironmentRequest>(StartEnvironmentRequestParser, {
        environmentId: req.params.id,
        projectId: req.params.projectId
      });
      const { environmentId, projectId } = validatedRequest;

      const environment = await projectEnvironmentService.getEnvironment(projectId, environmentId, true);
      const envType = environment.ETC!.type;
      if (['STOPPING', 'FAILED'].includes(environment.status)) {
        throw Boom.conflict(`Cannot start environment while environment is in ${environment.status} state`);
      } else if (['STARTING', 'PENDING', 'COMPLETED'].includes(environment.status)) {
        res.status(204).send();
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        await environments[`${envType}`].lifecycle.start(environmentId);
        res.status(204).send();
      } else {
        throw Boom.badRequest(
          `No service provided for environment. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Stop
  router.put(
    '/projects/:projectId/environments/:id/stop',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<StopEnvironmentRequest>(StopEnvironmentRequestParser, {
        environmentId: req.params.id,
        projectId: req.params.projectId
      });
      const { environmentId, projectId } = validatedRequest;
      const environment = await projectEnvironmentService.getEnvironment(projectId, environmentId, true);
      const envType = environment.ETC!.type;

      if (['PENDING', 'STARTING', 'FAILED'].includes(environment.status)) {
        throw Boom.conflict(`Cannot stop environment while environment is in ${environment.status} state`);
      } else if (['STOPPING', 'STOPPED'].includes(environment.status)) {
        res.status(204).send();
      } else if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        await environments[`${envType}`].lifecycle.stop(environmentId);
        res.status(204).send();
      } else {
        throw Boom.badRequest(
          `No service provided for environment. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Get environment connection creds
  router.get(
    '/projects/:projectId/environments/:id/connections',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ConnectEnvironmentRequest>(ConnectEnvironmentRequestParser, {
        environmentId: req.params.id,
        projectId: req.params.projectId
      });
      const environment = await projectEnvironmentService.getEnvironment(
        validatedRequest.projectId,
        validatedRequest.environmentId,
        true
      );
      const instanceName = environment.instanceId!;
      const envType = environment.ETC!.type;

      const context = {
        roleArn: environment.PROJ!.envMgmtRoleArn,
        externalId: environment.PROJ!.externalId
      };

      if (environment.status !== 'COMPLETED') {
        throw Boom.conflict(
          `Environment is in ${environment.status} state. Please wait until environment is in 'COMPLETED' state before trying to connect to the environment.`
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
        res.status(200).send(response);
      } else {
        throw Boom.badRequest(
          `No service provided for environment. Supported environments types are: ${supportedEnvs}`
        );
      }
    })
  );

  // Get environment
  router.get(
    '/projects/:projectId/environments/:id',
    wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
      const validatedRequest = validateAndParse<GetEnvironmentRequest>(GetEnvironmentRequestParser, {
        environmentId: req.params.id,
        projectId: req.params.projectId
      });
      const env = await projectEnvironmentService.getEnvironment(
        validatedRequest.projectId,
        validatedRequest.environmentId,
        true
      );
      if (env.projectId !== validatedRequest.projectId) {
        throw Boom.notFound(`Couldnt find environment with project`);
      }
      res.status(200).send(env);
    })
  );

  // List project environments
  router.get(
    '/projects/:projectId/environments',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListProjectEnvironmentsRequest>(
        ListProjectEnvironmentsRequestParser,
        { projectId: req.params.projectId, ...req.query }
      );
      const { paginationToken, pageSize, projectId } = validatedRequest;
      // Apply pagination if applicable
      if ((paginationToken && typeof paginationToken !== 'string') || (pageSize && Number(pageSize) <= 0)) {
        throw Boom.badRequest(
          'Invalid pagination token and/or page size. Please try again with valid inputs.'
        );
      }
      try {
        const response = await projectEnvironmentService.listProjectEnvs(
          projectId,
          pageSize ? Number(pageSize) : undefined,
          paginationToken
        );
        res.status(200).send(response);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing environments for project`);
      }
    })
  );
}
