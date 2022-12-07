/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// AWS Account management
import {
  CreateAccountSchema,
  AwsAccountTemplateUrlsParser,
  UpdateAccountSchema,
  HostingAccountService,
  CreateAccountData,
  UpdateAccountData,
  ListAccountRequest,
  ListAccountsRequestParser
} from '@aws/workbench-core-accounts';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { escape } from 'lodash';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult, validateAndParse } from './validatorHelper';

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
      processValidatorResult(validate(req.body, CreateAccountSchema));
      const { name, awsAccountId, envMgmtRoleArn, hostingAccountHandlerRoleArn, externalId } = req.body;
      const createAccountMetadata: CreateAccountData = {
        name: escape(name),
        awsAccountId: escape(awsAccountId),
        envMgmtRoleArn: escape(envMgmtRoleArn),
        hostingAccountHandlerRoleArn: escape(hostingAccountHandlerRoleArn),
        externalId: escape(externalId)
      };

      const createdAccount = await hostingAccountService.create(createAccountMetadata);
      res.status(201).send(createdAccount);
    })
  );

  router.patch(
    '/awsAccounts/:id',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, UpdateAccountSchema));
      const { name, awsAccountId, envMgmtRoleArn, hostingAccountHandlerRoleArn, externalId } = req.body;
      const updateAccountMetadata: UpdateAccountData = {
        id: escape(req.params.id),
        name: name!! ? escape(name) : undefined,
        awsAccountId: awsAccountId!! ? escape(awsAccountId) : undefined,
        envMgmtRoleArn: envMgmtRoleArn!! ? escape(envMgmtRoleArn) : undefined,
        hostingAccountHandlerRoleArn: hostingAccountHandlerRoleArn!!
          ? escape(hostingAccountHandlerRoleArn)
          : undefined,
        externalId: externalId!! ? escape(externalId) : undefined
      };

      const updatedAccount = await hostingAccountService.update(updateAccountMetadata);
      res.send(updatedAccount);
    })
  );
}
