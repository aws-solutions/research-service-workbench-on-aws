// User management
import { UserManagementService } from '@amzn/workbench-core-authentication';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpUserRoutes(router: Router, user: UserManagementService): void {
  router.post(
    '/user',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await user.createUser(req.body);
      res.status(201).send(response);
    })
  );

  router.post(
    '/role',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await user.createRole(req.body);
      res.status(201).send(response);
    })
  );

  router.put(
    '/user/:id/role/:roleName',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await user.addUserToRole(req.params.id, req.params.roleName);
      res.send(response);
    })
  );
}
