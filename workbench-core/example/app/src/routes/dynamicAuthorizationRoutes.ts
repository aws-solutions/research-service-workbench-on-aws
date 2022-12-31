/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamicAuthorizationService,
  isGroupAlreadyExistsError,
  isTooManyRequestsError,
  isThroughputExceededError,
  isGroupNotFoundError,
  isIdentityPermissionCreationError,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsRequestParser,
  isUserNotFoundError,
  GetIdentityPermissionsByIdentityRequest
} from '@aws/workbench-core-authorization';
import { GetIdentityPermissionsByIdentityRequestParser } from '@aws/workbench-core-authorization/lib/dynamicAuthorization/dynamicAuthorizationInputs/getIdentityPermissionsByIdentity';
import {
  AssignUserToGroupRequest,
  AssignUserToGroupRequestParser
} from '@aws/workbench-core-authorization/lib/models/assignUserToGroup';
import {
  CreateGroupRequest,
  CreateGroupRequestParser
} from '@aws/workbench-core-authorization/lib/models/createGroup';
import {
  GetUserGroupsRequest,
  GetUserGroupsRequestParser
} from '@aws/workbench-core-authorization/lib/models/getUserGroups';
import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Router, Request, Response } from 'express';
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
        const validatedRequest = validateAndParse<GetUserGroupsRequest>(
          GetUserGroupsRequestParser,
          req.params
        );

        const { data } = await service.getUserGroups({
          authenticatedUser: res.locals.user,
          ...validatedRequest
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

  router.post(
    '/authorization/groups/add-user',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const addUserToGroupRequest = validateAndParse<AssignUserToGroupRequest>(
          AssignUserToGroupRequestParser,
          req.body
        );
        const response = await service.addUserToGroup({
          ...addUserToGroupRequest,
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
  router.post(
    '/authorization/identitypermissions',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const authenticatedUser = res.locals.user;
        const validatedRequest = validateAndParse<CreateIdentityPermissionsRequest>(
          CreateIdentityPermissionsRequestParser,
          {
            ...req.body,
            authenticatedUser
          }
        );

        const { data } = await service.createIdentityPermissions(validatedRequest);
        res.status(201).send(data);
      } catch (err) {
        if (isGroupNotFoundError(err)) throw Boom.badRequest('One or more groups are not found');
        if (isThroughputExceededError(err))
          throw Boom.tooManyRequests('Exceed limit on creation of permissions');
        if (isIdentityPermissionCreationError(err))
          throw Boom.badRequest('One or more permissions already exist');
        throw err;
      }
    })
  );
  router.get(
    '/authorization/identitypermissions/identity',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetIdentityPermissionsByIdentityRequest>(
        GetIdentityPermissionsByIdentityRequestParser,
        req.query
      );
      const { data } = await service.getIdentityPermissionsByIdentity(validatedRequest);
      res.status(201).send(data);
    })
  );
}
