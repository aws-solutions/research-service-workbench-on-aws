// Environment launch
import { Request, Response, Router } from 'express';
import { Environment } from './apiRouteConfig';

export function setUpEnvRoutes(router: Router, environments: { [key: string]: Environment }): void {
  const supportedEnvs = Object.keys(environments);

  // Launch
  router.post('/environments', async (req: Request, res: Response) => {
    if (supportedEnvs.includes(req.body.envType.toLocaleLowerCase())) {
      // We check that envType is in list of supportedEnvs before calling the environments object

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

      const response = await environments[req.body.envType].lifecycle.stop(req.params.id);
      res.send(response);
    } else {
      res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
    }
  });

  // Get environment connection creds
  router.get('/environments/:id/connections', async (req: Request, res: Response) => {
    // Mocked getEnvironment from DDB
    const getEnvironment = (
      envId: string
    ): { envType: string; instanceName: string; roleArn: string; externalId: string } => {
      console.log('envId', envId);
      return {
        envType: 'sagemaker',
        instanceName: 'BasicNotebookInstance-juLcUavyKDQo',
        roleArn: 'arn:aws:iam::<HOSTING-ACCOUNT-ID>:role/swb-dev-oh-env-mgmt',
        externalId: 'workbench'
      };
    };
    const { envType, instanceName, roleArn, externalId } = getEnvironment(req.params.id);
    if (supportedEnvs.includes(envType.toLocaleLowerCase())) {
      const context = {
        roleArn,
        externalId
      };
      // We check that envType is in list of supportedEnvs before calling the environments object
      // eslint-disable-next-line security/detect-object-injection
      const authCredResponse = await environments[envType].connection.getAuthCreds(instanceName, context);
      // We check that envType is in list of supportedEnvs before calling the environments object
      // eslint-disable-next-line security/detect-object-injection
      const instructionResponse = await environments[envType].connection.getConnectionInstruction();
      const response = {
        ...authCredResponse,
        instructionResponse
      };
      res.send(response);
    } else {
      res.send(`No service provided for environment ${req.body.envType.toLocaleLowerCase()}`);
    }
  });
}
