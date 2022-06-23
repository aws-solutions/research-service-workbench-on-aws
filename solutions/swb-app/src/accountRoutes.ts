// AWS Account management
import { HostingAccountService } from '@amzn/environments';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';

export function setUpAccountRoutes(router: Router, account: HostingAccountService): void {
  // Provision
  router.post(
    '/aws-accounts',
    wrapAsync(async (req: Request, res: Response) => {
      const response = await account.create(req.body);
      res.send(response);
    })
  );
}
