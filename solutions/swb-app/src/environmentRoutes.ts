// Environment launch
import { Request, Response, Router } from 'express';
import { Environment } from './apiRouteConfig';
import { EnvironmentService } from '@amzn/environments';

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
      const response = await environments[req.body.envType].lifecycle.launch(req.body);
      res.send(response);
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

  // List Environments
  // router.get('/environments/:id', async (req: Request, res: Response) => {
  //   const response = await
  //   if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
  //     // We check that envType is in list of supportedEnvs before calling the environments object
  //     // nosemgrep
  //     const response = await ;
  //     res.send(response);
  //   } else {
  //     res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
  //   }
  // })
}
