/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Auth management
import {
  DynamicAuthorizationService,
  AssignUserToGroupRequest,
  AssignUserToGroupRequestParser
} from '@aws/workbench-core-authorization';
import { validateAndParse } from '@aws/workbench-core-base';
import { Router, Request, Response } from 'express';
import { wrapAsync } from '../utilities/errorHandlers';

export function setUpDynamicAuthorizationRoutes(router: Router, service: DynamicAuthorizationService): void {
  // Get auth provider's login URL with temporary state and PKCE strings
  router.patch(
    '/groups/addUserToGroup',
    wrapAsync(async (req: Request, res: Response) => {
      const addUserToGroupRequest = validateAndParse<AssignUserToGroupRequest>(
        AssignUserToGroupRequestParser,
        req.body
      );
      await service.addUserToGroup({
        ...addUserToGroupRequest,
        authenticatedUser: res.locals.user
      });
      res.status(204).send();
    })
  );
}
