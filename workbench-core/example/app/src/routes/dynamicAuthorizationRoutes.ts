/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamicAuthorizationService,
  isGroupAlreadyExistsError,
  isGroupNotFoundError,
  isTooManyRequestsError,
  isUserNotFoundError
} from '@aws/workbench-core-authorization';
import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Router, Request, Response } from 'express';
import {
  AddUserToGroupRequest,
  AddUserToGroupRequestParser
} from '../models/dynamicAuthorization/addUserToGroup';
import { CreateGroupRequest, CreateGroupRequestParser } from '../models/dynamicAuthorization/createGroup';
import {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupRequestParser
} from '../models/dynamicAuthorization/removeUserFromGroup';
import { wrapAsync } from '../utilities/errorHandlers';

export function setUpDynamicAuthorizationRoutes(router: Router, service: DynamicAuthorizationService): void {
  router.post(
    '/authorization/groups',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const validatedRequest = validateAndParse<CreateGroupRequest>(CreateGroupRequestParser, req.body);

        const { data } = await service.createGroup({
          authenticatedUser: res.locals.user,
          ...validatedRequest
        });
        res.status(201).send(data);
      } catch (error) {
        if (isGroupAlreadyExistsError(error)) {
          throw Boom.badRequest(error.message);
        }
        if (isTooManyRequestsError(error)) {
          throw Boom.tooManyRequests(error.message);
        }
        throw error;
      }
    })
  );

  router.get(
    '/authorization/groups/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const { data } = await service.getUserGroups({
          authenticatedUser: res.locals.user,
          userId: req.params.userId
        });
        res.status(200).send(data);
      } catch (error) {
        if (isUserNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        throw error;
      }
    })
  );

  router.put(
    '/authorization/groups/:groupId/add-user',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const addUserToGroupRequest = validateAndParse<AddUserToGroupRequest>(
          AddUserToGroupRequestParser,
          req.body
        );
        const response = await service.addUserToGroup({
          ...addUserToGroupRequest,
          groupId: req.params.groupId,
          authenticatedUser: res.locals.user
        });
        res.status(200).send(response.data);
      } catch (error) {
        if (isUserNotFoundError(error) || isGroupNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }

        throw error;
      }
    })
  );

  router.put(
    '/authorization/groups/:groupId/remove-user',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const removeUserFromGroupRequest = validateAndParse<RemoveUserFromGroupRequest>(
          RemoveUserFromGroupRequestParser,
          req.body
        );
        const response = await service.removeUserFromGroup({
          ...removeUserFromGroupRequest,
          groupId: req.params.groupId,
          authenticatedUser: res.locals.user
        });
        res.status(200).send(response.data);
      } catch (error) {
        if (isUserNotFoundError(error) || isGroupNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }

        throw error;
      }
    })
  );
}
