/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// AWS Account management
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';

import { isInvalidAwsAccountIdError } from './accounts/errors/InvalidAwsAccountIdError';
import {
  AwsAccountTemplateUrlsRequest,
  AwsAccountTemplateUrlsRequestParser
} from './accounts/models/accounts/awsAccountTemplateUrlsRequest';
import {
  CreateAccountRequest,
  CreateAccountRequestParser
} from './accounts/models/accounts/createAccountRequest';
import { GetAccountRequest, GetAccountRequestParser } from './accounts/models/accounts/getAccountRequest';
import {
  ListAccountRequest,
  ListAccountsRequestParser
} from './accounts/models/accounts/listAccountsRequest';
import {
  UpdateAccountRequest,
  UpdateAccountRequestParser
} from './accounts/models/accounts/updateAccountRequest';
import HostingAccountService from './accounts/services/hostingAccountService';
import { isInvalidPaginationTokenError } from './base/errors/invalidPaginationTokenError';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpAccountRoutes(router: Router, hostingAccountService: HostingAccountService): void {
  router.get(
    '/awsAccounts',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ListAccountRequest>(ListAccountsRequestParser, req.query);
      try {
        res.send(await hostingAccountService.list(validatedRequest));
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing accounts`);
      }
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
      try {
        const createdAccount = await hostingAccountService.create(validatedRequest);
        res.status(201).send(createdAccount);
      } catch (e) {
        if (isInvalidAwsAccountIdError(e)) {
          throw Boom.badRequest(e.message);
        }
        throw e;
      }
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
