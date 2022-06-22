// User management
// import { LoggingService } from '@amzn/workbench-core-logging';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

// Create Logger Service
// const logger: LoggingService = new LoggingService();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setUpUserRoutes(router: Router, user: any): void {
  router.post(
    '/user',
    wrapAsync(async (req: Request, res: Response) => {
      res.send(`Create User has not been implemented`);
    })
  );

  router.post(
    '/role',
    wrapAsync(async (req: Request, res: Response) => {
      res.send(`Create Role has not been implemented`);
    })
  );

  router.put(
    '/user/:id/role/:roleName',
    wrapAsync(async (req: Request, res: Response) => {
      res.send(`Assign User to Role has not been implemented`);
    })
  );
}
