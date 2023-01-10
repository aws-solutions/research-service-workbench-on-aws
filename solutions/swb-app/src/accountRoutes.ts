/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// AWS Account management
import {
  AwsAccountTemplateUrlsParser,
  HostingAccountService,
  CreateAccountRequestParser,
  ListAccountRequest,
  ListAccountsRequestParser,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateAccountRequestParser
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
      res.send(await hostingAccountService.get(req.params.id));
    })
  );

  router.post(
    '/awsAccountTemplateUrls',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = AwsAccountTemplateUrlsParser.parse(req.body);
      res.send(await hostingAccountService.buildTemplateUrlsForAccount(validatedRequest.externalId));
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
      // processValidatorResult(validate(req.body, UpdateAccountSchema));
      // const { name } = req.body;
      // const updateAccountMetadata: UpdateAccountData = {
      //   id: escape(req.params.id),
      //   name: name!! ? escape(name) : undefined
      // };
      const validatedRequest = validateAndParse<UpdateAccountRequest>(UpdateAccountRequestParser, {
        id: req.params.id,
        ...req.body
      });

      const updatedAccount = await hostingAccountService.update(validatedRequest);
      res.send(updatedAccount);
    })
  );
}
