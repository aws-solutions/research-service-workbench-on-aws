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
      const response = await account.create(req.body);
      res.send(response);
    })
  );

  router.patch(
    '/aws-accounts/:awsAccountId',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, UpdateAccountSchema));
      const response = await account.update(req.body);
      res.send(response);
    })
  );
}
