// Environment launch
import { NextFunction, Request, Response, Router } from 'express';
import { Environment } from './apiRouteConfig';
import { EnvironmentService, isEnvironmentStatus } from '@amzn/environments';
import { wrapAsync } from './errorHandlers';
import Boom from '@hapi/boom';

export function setUpEnvRoutes(
  router: Router,
  environments: { [key: string]: Environment },
  environmentService: EnvironmentService
): void {
  const supportedEnvs = Object.keys(environments).map((env) => {
    return env.toLocaleLowerCase();
  });

  async function getEnvironmentType(envId: string): Promise<string> {
    const env = await environmentService.getEnvironment(envId, true);
    return env.ETC.type;
  }

  // Launch
  router.post(
    '/environments',
    wrapAsync(async (req: Request, res: Response) => {
      const envType = req.body.envType;
      if (supportedEnvs.includes(envType.toLocaleLowerCase())) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        if (req.body.id) {
          throw Boom.badRequest(
            'id cannot be passed in the request body when trying to launch a new environment'
          );
        }
        const env = await environmentService.createEnvironment(req.body);
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
        res.send(`No service provided for environment ${envType}`);
      }
    })
  );

  // Terminate
  router.delete(
    '/environments/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const envType = (await getEnvironmentType(req.params.id)).toLocaleLowerCase();

      if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        //eslint-disable-next-line security/detect-object-injection
        const response = await environments[envType].lifecycle.terminate(req.params.id);
        res.send(response);
      } else {
        res.send(`No service provided for environment ${envType}`);
      }
    })
  );

  // Start
  router.put(
    '/environments/:id/start',
    wrapAsync(async (req: Request, res: Response) => {
      const envType = (await getEnvironmentType(req.params.id)).toLocaleLowerCase();

      if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        //eslint-disable-next-line security/detect-object-injection
        const response = await environments[envType].lifecycle.start(req.params.id);
        res.send(response);
      } else {
        res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
      }
    })
  );

  // Stop
  router.put(
    '/environments/:id/stop',
    wrapAsync(async (req: Request, res: Response) => {
      const envType = (await getEnvironmentType(req.params.id)).toLocaleLowerCase();

      if (supportedEnvs.includes(envType)) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        //eslint-disable-next-line security/detect-object-injection
        const response = await environments[envType].lifecycle.stop(req.params.id);
        res.send(response);
      } else {
        res.send(`No service provided for environment ${envType}`);
      }
    })
  );

  // Get environment connection creds
  router.get(
    '/environments/:id/connections',
    wrapAsync(async (req: Request, res: Response) => {
      const environment = await environmentService.getEnvironment(req.params.id, true);
      const instanceName = environment.instanceId!;
      const envType = environment.ETC.type.toLocaleLowerCase();

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
        res.send(`No service provided for environment ${envType}`);
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
      // TODO: Get user information from req context once Auth has been integrated
      const user = {
        role: 'admin',
        ownerId: ''
      };
      const { status } = req.query;
      let filter = undefined;
      if (isEnvironmentStatus(status)) {
        filter = {
          status
        };
      }
      // TODO: Add support for pagination with limit and pagination token
      const env = await environmentService.getEnvironments(user, filter);
      res.send(env);
    })
  );
}
