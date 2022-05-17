// Environment launch
import { Request, Response, Router } from 'express';
import { Environment } from './apiRouteConfig';
import { EnvironmentService, isEnvironmentStatus } from '@amzn/environments';

export function setUpEnvRoutes(
  router: Router,
  environments: { [key: string]: Environment },
  environmentService: EnvironmentService
): void {
  const supportedEnvs = Object.keys(environments);

  // Launch
  router.post('/environments', async (req: Request, res: Response) => {
    if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
      // We check that envType is in list of supportedEnvs before calling the environments object
      // nosemgrep
      await environments[req.body.envType].lifecycle.launch(req.body);
      // TODO: Handle errors from executing SSM document
      const env = await environmentService.createEnvironment(req.body);
      res.send(env);
    } else {
      res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
    }
  });

  // Terminate
  router.delete('/environments/:id', async (req: Request, res: Response) => {
    if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
      // We check that envType is in list of supportedEnvs before calling the environments object
      // nosemgrep
      const response = await environments[req.body.envType].lifecycle.terminate(req.params.id);
      res.send(response);
    } else {
      res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
    }
  });

  // Start
  router.put('/environments/:id/start', async (req: Request, res: Response) => {
    if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
      // We check that envType is in list of supportedEnvs before calling the environments object
      // nosemgrep
      const response = await environments[req.body.envType].lifecycle.start(req.params.id);
      res.send(response);
    } else {
      res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
    }
  });

  // Stop
  router.put('/environments/:id/stop', async (req: Request, res: Response) => {
    if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
      // We check that envType is in list of supportedEnvs before calling the environments object
      // nosemgrep
      const response = await environments[req.body.envType].lifecycle.stop(req.params.id);
      res.send(response);
    } else {
      res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
    }
  });

  // Get environment connection creds
  router.get('/environments/:id/connections', async (req: Request, res: Response) => {
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
  });

  // Get Environment
  router.get('/environments/:id', async (req: Request, res: Response) => {
    const env = await environmentService.getEnvironment(req.params.id, true);
    res.send(env);
  });

  // Get environments
  router.get('/environments', async (req: Request, res: Response) => {
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
  });
}
