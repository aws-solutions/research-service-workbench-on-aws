/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

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
      const response = await environmentService.listEnvironments(request);
      res.send(response);
    })
  );
}
