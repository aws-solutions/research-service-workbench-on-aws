/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// User management
import { validateAndParse } from '@aws/workbench-core-base';
import {
  isInvalidParameterError,
  isRoleAlreadyExistsError,
  isRoleNotFoundError,
  isTooManyRequestsError,
  isUserAlreadyExistsError,
  isUserNotFoundError,
  UserManagementService
} from '@aws/workbench-core-user-management';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { ActivateUserRequest, ActivateUserRequestParser } from '../models/user/activateUserRequest';
import { AddUserToRoleRequest, AddUserToRoleRequestParser } from '../models/user/addUserToRole';
import { CreateRoleRequest, CreateRoleRequestParser } from '../models/user/createRoleRequest';
import { CreateUserRequest, CreateUserRequestParser } from '../models/user/createUserRequest';
import { DeactivateUserRequest, DeactivateUserRequestParser } from '../models/user/deactivateUserRequest';
import { DeleteUserRequest, DeleteUserRequestParser } from '../models/user/deleteUserRequest';
import { GetRolesRequest, GetRolesRequestParser } from '../models/user/getRolesRequest';
import { GetUserRequest, GetUserRequestParser } from '../models/user/getUserRequest';
import { wrapAsync } from '../utilities/errorHandlers';

export function setUpUserRoutes(router: Router, service: UserManagementService): void {
  router.post(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateUserRequest>(CreateUserRequestParser, {
        ...req.body
      });
      try {
        const user = await service.createUser(validatedRequest);
        res.status(201).send(user);
      } catch (e) {
        if (isUserAlreadyExistsError(e) || isInvalidParameterError(e)) {
          throw Boom.badRequest(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.get(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const users = await service.listUsers({});
        res.status(200).json(users);
      } catch (e) {
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.get(
    '/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetUserRequest>(GetUserRequestParser, {
        userId: req.params.userId
      });
      try {
        const user = await service.getUser(validatedRequest.userId);
        res.status(200).json(user);
      } catch (e) {
        if (isUserNotFoundError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.delete(
    '/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<DeleteUserRequest>(DeleteUserRequestParser, {
        userId: req.params.userId
      });
      try {
        const user = await service.deleteUser(validatedRequest.userId);
        res.status(200).json(user);
      } catch (e) {
        if (isUserNotFoundError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.put(
    '/users/:userId/activate',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<ActivateUserRequest>(ActivateUserRequestParser, {
        userId: req.params.userId
      });
      try {
        const user = await service.activateUser(validatedRequest.userId);
        res.status(200).json(user);
      } catch (e) {
        if (isUserNotFoundError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.put(
    '/users/:userId/deactivate',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<DeactivateUserRequest>(DeactivateUserRequestParser, {
        userId: req.params.userId
      });
      try {
        const user = await service.deactivateUser(validatedRequest.userId);
        res.status(200).json(user);
      } catch (e) {
        if (isUserNotFoundError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.get(
    '/users/:userId/roles',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<GetRolesRequest>(GetRolesRequestParser, {
        userId: req.params.userId
      });
      try {
        const roles = await service.getUserRoles(validatedRequest.userId);
        res.status(200).json(roles);
      } catch (e) {
        if (isUserNotFoundError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.post(
    '/roles',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateRoleRequest>(CreateRoleRequestParser, req.body);
      try {
        const response = await service.createRole(validatedRequest.roleName);
        res.status(201).send(response);
      } catch (e) {
        if (isRoleAlreadyExistsError(e)) {
          throw Boom.badRequest(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );

  router.put(
    '/roles/:roleName',
    wrapAsync(async (req: Request, res: Response) => {
      const addUserToRoleRequest = validateAndParse<AddUserToRoleRequest>(AddUserToRoleRequestParser, {
        ...req.body,
        roleName: req.params.roleName
      });
      try {
        const response = await service.addUserToRole(
          addUserToRoleRequest.userId,
          addUserToRoleRequest.roleName
        );
        res.send(response);
      } catch (e) {
        if (isUserNotFoundError(e) || isRoleNotFoundError(e)) {
          throw Boom.notFound(e.message);
        }
        if (isTooManyRequestsError(e)) {
          throw Boom.tooManyRequests(e.message);
        }
        throw e;
      }
    })
  );
}
