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
    wrapAuth(async (req: Request, res: Response) => {
      res.status(200).send();
    }, dynamicAuthorizationService)
  );

  router.get(
    '/listAllResources',
    wrapAuth(async (req: Request, res: Response) => {
      res.status(200).send();
    }, dynamicAuthorizationService)
  );

  router.get(
    '/listResources/:parentId',
    wrapAuth(async (req: Request, res: Response) => {
      res.status(200).send();
    }, dynamicAuthorizationService)
  );

  router.post(
    '/createResource',
    wrapAuth(async (req: Request, res: Response) => {
      res.status(200).send();
    }, dynamicAuthorizationService)
  );
}
