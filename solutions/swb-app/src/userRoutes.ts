// User management
import { UserManagementService } from '@amzn/workbench-core-authentication';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpUserRoutes(router: Router, user: UserManagementService): void {
  router.post(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await user.createUser(req.body);
      res.status(201).send(response);
    })
  );

  router.get(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      const userIds = await user.listUsers();
      const users: Array<object> = [];
      userIds.forEach((userId) => {
        users.push({ id: userId });
      });
      res.status(200).json({ users: users });
    })
  );

  router.post(
    '/roles',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await user.createRole(req.body);
      res.status(201).send(response);
    })
  );

  router.put(
    '/users/:id/roles/:roleName',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await user.addUserToRole(req.params.id, req.params.roleName);
      res.send(response);
    })
  );
}
