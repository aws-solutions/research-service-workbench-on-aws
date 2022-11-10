/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateAccountSchema,
  UpdateAccountSchema,
  HostingAccountService
} from '@aws/workbench-core-accounts';
import { ListAccountsRequestParser } from '@aws/workbench-core-accounts/lib/models/accounts/listAcountsRequest';
import {
  CreateAccountMetadata,
  UpdateAccountMetadata
} from '@aws/workbench-core-accounts/lib/utilities/hostingAccountLifecycleService';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { escape } from 'lodash';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpAccountRoutes(router: Router, hostingAccountService: HostingAccountService): void {
  router.get(
    '/aws-accounts',
    wrapAsync(async (req: Request, res: Response) => {
      const listRequest = ListAccountsRequestParser.parse(req.params);
      res.send(await hostingAccountService.list(listRequest));
    })
  );

  router.get(
    '/aws-accounts/:id',
    wrapAsync(async (req: Request, res: Response) => {
      res.send(await hostingAccountService.get(req.params.id));
    })
  );

  router.post(
    '/aws-accounts',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateAccountSchema));
      const { name, awsAccountId, envMgmtRoleArn, hostingAccountHandlerRoleArn, externalId } = req.body;
      const createAccountMetadata: CreateAccountMetadata = {
        name: escape(name),
        awsAccountId: escape(awsAccountId),
        envMgmtRoleArn: escape(envMgmtRoleArn),
        hostingAccountHandlerRoleArn: escape(hostingAccountHandlerRoleArn),
        externalId: escape(externalId)
      };

      const createdAccount = await hostingAccountService.create(createAccountMetadata);
      res.send(createdAccount);
    })
  );

  router.patch(
    '/aws-accounts/:id',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, UpdateAccountSchema));
      const { name, awsAccountId, envMgmtRoleArn, hostingAccountHandlerRoleArn, externalId } = req.body;
      const updateAccountMetadata: UpdateAccountMetadata = {
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
