import { EnvironmentTypeConfigService } from '@amzn/environments';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpEnvTypeConfigRoutes(
  router: Router,
  environmentTypeConfigService: EnvironmentTypeConfigService
): void {
  // Create envTypeConfig
  router.post(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      // TODO: Get user information from req context once Auth has been integrated
      const user = {
        role: 'admin',
        owner: 'owner-123'
      };
      const envTypeConfig = await environmentTypeConfigService.createNewEnvironmentTypeConfig(
        user.owner,
        req.params.envTypeId,
        req.body
      );
      res.status(201).send(envTypeConfig);
    })
  );

  // Get envTypeConfig
  router.get(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      // TODO: Get user information from req context once Auth has been integrated
      const user = {
        role: 'admin',
        owner: 'owner-123'
      };
      const envTypeConfig = await environmentTypeConfigService.getEnvironmentTypeConfig(
        user,
        req.params.envTypeId,
        req.params.envTypeConfigId
      );
      res.send(envTypeConfig);
    })
  );
  // Get envTypeConfigs
  router.get(
    '/environmentTypes/:envTypeId/configurations',
    wrapAsync(async (req: Request, res: Response) => {
      // TODO: Get user information from req context once Auth has been integrated
      const user = {
        role: 'admin',
        owner: 'owner-123'
      };
      const envTypeConfig = await environmentTypeConfigService.getEnvironmentTypeConfigs(
        user,
        req.params.envTypeId
      );
      res.send(envTypeConfig);
    })
  );

  // Update envTypeConfig
  router.put(
    '/environmentTypes/:envTypeId/configurations/:envTypeConfigId',
    wrapAsync(async (req: Request, res: Response) => {
      // TODO: Get user information from req context once Auth has been integrated
      const user = {
        role: 'admin',
        owner: 'owner-123'
      };
      const envTypeConfig = await environmentTypeConfigService.updateEnvironmentTypeConfig(
        user,
        req.params.envTypeId,
        req.params.envTypeConfigId,
        req.body
      );
      res.status(200).send(envTypeConfig);
    })
  );
}
