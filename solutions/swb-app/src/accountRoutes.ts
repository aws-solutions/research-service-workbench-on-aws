/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// AWS Account management
import {
  AwsAccountTemplateUrlsRequest,
  AwsAccountTemplateUrlsRequestParser,
  HostingAccountService,
  CreateAccountRequestParser,
  ListAccountRequest,
  ListAccountsRequestParser,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateAccountRequestParser,
  GetAccountRequest,
  GetAccountRequestParser
} from '@aws/workbench-core-accounts';
import { Request, Response, Router } from 'express';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpAccountRoutes(router: Router, hostingAccountService: HostingAccountService): void {
  router.get(
    '/awsAccounts',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListAccountRequest>(ListAccountsRequestParser, req.query);
      res.send(await hostingAccountService.list(validatedRequest));
    })
  );

  router.get(
    '/awsAccounts/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetAccountRequest>(GetAccountRequestParser, {
        id: req.params.id
      });
      res.send(await hostingAccountService.get(validatedRequest));
    })
  );

  router.post(
    '/awsAccountTemplateUrls',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<AwsAccountTemplateUrlsRequest>(
        AwsAccountTemplateUrlsRequestParser,
        req.body
      );
      res.send(await hostingAccountService.buildTemplateUrlsForAccount(validatedRequest));
    })
  );

  router.post(
    '/awsAccounts',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateAccountRequest>(CreateAccountRequestParser, req.body);

      const createdAccount = await hostingAccountService.create(validatedRequest);
      res.status(201).send(createdAccount);
    })
  );

  router.patch(
    '/awsAccounts/:id',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<UpdateAccountRequest>(UpdateAccountRequestParser, {
        id: req.params.id,
        ...req.body
      });

      const updatedAccount = await hostingAccountService.update(validatedRequest);
      res.send(updatedAccount);
    })
  );
}
