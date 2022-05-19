// Environment launch
import { NextFunction, Request, Response, Router } from 'express';
import { Environment } from './apiRouteConfig';
import { EnvironmentService, isEnvironmentStatus } from '@amzn/environments';
import { wrapAsync } from './errorHandlers';

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
      if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        // nosemgrep
        const env = await environmentService.createEnvironment(req.body);
        try {
          await environments[req.body.envType].lifecycle.launch(env);
        } catch (e) {
          // Update error state
          const errorMessage = e.message as string;
          await environmentService.updateEnvironment(env.id!, {
            error: { type: 'LAUNCH', value: errorMessage },
            status: 'FAILED'
          });
        }
        res.status(201).send(env);
      } else {
        res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
      }
    })
  );

  // Terminate
  router.delete(
    '/environments/:id',
    wrapAsync(async (req: Request, res: Response) => {
      if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        // nosemgrep
        const response = await environments[req.body.envType].lifecycle.terminate(req.params.id);
        res.send(response);
      } else {
        res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
      }
    })
  );

  // Start
  router.put(
    '/environments/:id/start',
    wrapAsync(async (req: Request, res: Response) => {
      if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        // nosemgrep
        const response = await environments[req.body.envType].lifecycle.start(req.params.id);
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
      if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        // nosemgrep
        const response = await environments[req.body.envType].lifecycle.stop(req.params.id);
        res.send(response);
      } else {
        res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
      }
    })
  );

  // Get environment connection creds
  router.get(
    '/environments/:id/connections',
    wrapAsync(async (req: Request, res: Response) => {
      // Mocked getEnvironment
      const getEnvironment = (envId: string): { envType: string; instanceName: string } => {
        console.log('envId', envId);
        return { envType: 'sagemaker', instanceName: 'abc' };
      };
      const { envType, instanceName } = getEnvironment(req.params.id);
      if (supportedEnvs.includes(envType.toLocaleLowerCase())) {
        // We check that envType is in list of supportedEnvs before calling the environments object
        // eslint-disable-next-line security/detect-object-injection
        const authCredResponse = await environments[envType].connection.getAuthCreds(instanceName); // nosemgrep
        // We check that envType is in list of supportedEnvs before calling the environments object
        // eslint-disable-next-line security/detect-object-injection
        const instructionResponse = await environments[envType].connection.getConnectionInstruction(); // nosemgrep
        const response = {
          authCredResponse,
          instructionResponse
        };
        res.send(response);
      } else {
        res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
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
      // TODO: Handle environment not found
      // TODO: Add support for pagination with limit and pagination token
      const env = await environmentService.getEnvironments(user, filter);
      res.send(env);
    })
  );
}
