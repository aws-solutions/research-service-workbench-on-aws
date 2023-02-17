/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { wrapAsync } from '../utilities/errorHandlers';
//Used for testing dynamic authorization
export function setupSampleRoutes(router: Router): void {
  router.put(
    '/parentResource/:parentId/resource/:resourceId',
    wrapAsync(async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );

  router.get(
    '/listAllResources',
    wrapAsync(async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );

  router.get(
    '/listResources/:parentId',
    wrapAsync(async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );

  router.post(
    '/createResource',
    wrapAsync(async (req: Request, res: Response) => {
      res.status(200).send();
    })
  );
}
