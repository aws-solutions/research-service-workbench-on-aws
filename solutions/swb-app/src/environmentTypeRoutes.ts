import { EnvironmentTypeService, isEnvironmentTypeStatus, ENVIRONMENT_TYPE_STATUS } from '@amzn/environments';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpEnvTypeRoutes(router: Router, environmentTypeService: EnvironmentTypeService): void {
  // Create envType
  router.post(
    '/environmentTypes',
    wrapAsync(async (req: Request, res: Response) => {
      const { status } = req.body;
      if (!isEnvironmentTypeStatus(status)) {
        throw Boom.badRequest(
          `Status provided is: ${status}. Status needs to be one of these values: ${ENVIRONMENT_TYPE_STATUS}`
        );
      }
      // TODO: Get user information from req context once Auth has been integrated
      const user = {
        role: 'admin',
        ownerId: 'owner-123'
      };
      const envType = await environmentTypeService.createNewEnvironmentType(user.ownerId, {
        ...req.body
      });
      res.status(201).send(envType);
    })
  );

  // Get envType
  router.get(
    '/environmentTypes/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const envType = await environmentTypeService.getEnvironmentType(req.params.id);
      res.send(envType);
    })
  );

  // Get envTypes
  router.get(
    '/environmentTypes',
    wrapAsync(async (req: Request, res: Response) => {
      const envType = await environmentTypeService.getEnvironmentTypes();
      res.send(envType);
    })
  );

  // Update envTypes
  router.put(
    '/environmentTypes/:id',
    wrapAsync(async (req: Request, res: Response) => {
      // TODO: Get user information from req context once Auth has been integrated
      const user = {
        role: 'admin',
        ownerId: 'owner-123'
      };
      const { status } = req.body;
      if (!isEnvironmentTypeStatus(status)) {
        throw Boom.badRequest(
          `Status provided is: ${status}. Status needs to be one of these values: ${ENVIRONMENT_TYPE_STATUS}`
        );
      }
      const envType = await environmentTypeService.updateEnvironmentType(
        user.ownerId,
        req.params.id,
        req.body
      );
      res.status(200).send(envType);
    })
  );
}
