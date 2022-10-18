/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// AWS Account management
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  HostingAccountService
} from '@aws/workbench-core-accounts';
import {
  CreateAccountMetadata,
  UpdateAccountMetadata
} from '@aws/workbench-core-accounts/lib/utilities/hostingAccountLifecycleService';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpAccountRoutes(router: Router, account: HostingAccountService): void {
  // Provision
  router.post(
    '/aws-accounts',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateAccountSchema));
      const createAccountMetadata: CreateAccountMetadata = {
        ...req.body
      };
      const createdAccount = await account.create(createAccountMetadata);
      res.send(createdAccount);
    })
  );

  router.patch(
    '/aws-accounts/:id',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, UpdateAccountSchema));
      const updateAccountMetadata: UpdateAccountMetadata = {
        id: req.params.id,
        ...req.body
      };
      const updatedAccount = await account.update(updateAccountMetadata);
      res.send(updatedAccount);
    })
  );
}
