/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { DynamicAuthorizationService } from '../../../../authorization/lib';
import { wrapAuth } from '../utilities/authWrapper';
//Used for testing dynamic authorization
export function setupSampleRoutes(
  router: Router,
  dynamicAuthorizationService: DynamicAuthorizationService
): void {
  router.put(
    '/parentResource/:parentId/resource/:resourceId',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );

  router.get(
    '/listAllResources',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );

  router.get(
    '/listResources/:parentId',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );

  router.post(
    '/createResource',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );
}
