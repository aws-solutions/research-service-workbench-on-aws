/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { isPluginConfigurationError } from '@aws/workbench-core-authentication';
import { isGroupNotFoundError } from '@aws/workbench-core-authorization';
import {
  DynamicAuthorizationService,
  isGroupAlreadyExistsError,
  isTooManyRequestsError
} from '@aws/workbench-core-authorization';
import {
  AssignUserToGroupRequest,
  AssignUserToGroupRequestParser
} from '@aws/workbench-core-authorization/lib/models/assignUserToGroup';
import {
  CreateGroupRequest,
  CreateGroupRequestParser
} from '@aws/workbench-core-authorization/lib/models/createGroup';
import { validateAndParse } from '@aws/workbench-core-base';
import { isUserNotFoundError } from '@aws/workbench-core-user-management';
import * as Boom from '@hapi/boom';
import { Router, Request, Response } from 'express';
import { dynamicAuthorizationService } from '../services/dynamicAuthorizationService';
import { wrapAsync } from '../utilities/errorHandlers';

export function setUpDynamicAuthorizationRoutes(router: Router, service: DynamicAuthorizationService): void {
  router.post(
    '/authorization/groups',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const validatedRequest = validateAndParse<CreateGroupRequest>(CreateGroupRequestParser, req.body);

        const { data } = await dynamicAuthorizationService.createGroup({
          authenticatedUser: res.locals.user,
          ...validatedRequest
        });
        res.status(201).send(data);
      } catch (error) {
        if (isGroupAlreadyExistsError(error)) {
          throw Boom.badRequest('Group already exists');
        }
        if (isPluginConfigurationError(error)) {
          throw Boom.internal('An internal error occurred');
        }
        if (isTooManyRequestsError(error)) {
          throw Boom.tooManyRequests('Too many requests');
        }
        throw error;
      }
    })
  );

  router.post(
    '/authorization/groups/add-user',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const addUserToGroupRequest = validateAndParse<AssignUserToGroupRequest>(
          AssignUserToGroupRequestParser,
          req.body
        );
        await service.addUserToGroup({
          ...addUserToGroupRequest,
          authenticatedUser: res.locals.user
        });
        res.status(204).send();
      } catch (error) {
        if (isGroupNotFoundError(error)) {
          throw Boom.notFound('Role not found');
        }
        if (isUserNotFoundError(error)) {
          throw Boom.notFound('User not found');
        }
        if (isPluginConfigurationError(error)) {
          throw Boom.internal(error.message);
        }

        throw error;
      }
    })
  );
}
