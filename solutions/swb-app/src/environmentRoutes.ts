/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { isInvalidPaginationTokenError } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { EnvironmentPlugin } from './environments/environmentPlugin';
import {
  ListEnvironmentsRequest,
  ListEnvironmentsRequestParser
} from './environments/listEnvironmentsRequest';
import { wrapAsync } from './errorHandlers';
import { validateAndParse } from './validatorHelper';

export function setUpEnvRoutes(router: Router, environmentService: EnvironmentPlugin): void {
  // Get environments
  router.get(
    '/environments',
    wrapAsync(async (req: Request, res: Response) => {
      const request = validateAndParse<ListEnvironmentsRequest>(ListEnvironmentsRequestParser, req.query);
      try {
        const response = await environmentService.listEnvironments(request);
        res.status(200).send(response);
      } catch (e) {
        if (Boom.isBoom(e)) {
          throw e;
        }

        if (isInvalidPaginationTokenError(e)) {
          throw Boom.badRequest(e.message);
        }

        throw Boom.badImplementation(`There was a problem listing environments`);
      }
    })
  );
}
