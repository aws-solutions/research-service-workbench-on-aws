/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// User management
import { validateAndParse } from '@aws/workbench-core-base';
import {
  CreateRoleSchema,
  CreateUserSchema,
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
import { validate } from 'jsonschema';
import { AddUserToRoleRequest, AddUserToRoleRequestParser } from '../models/user/addUserToRole';
import { wrapAsync } from '../utilities/errorHandlers';
import { processValidatorResult } from '../utilities/validatorHelper';

export function setUpUserRoutes(router: Router, service: UserManagementService): void {
  router.post(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateUserSchema));
      try {
        const user = await service.createUser(req.body);
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
        const users = await service.listUsers();
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
      try {
        const user = await service.getUser(req.params.userId);
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
      try {
        const user = await service.deleteUser(req.params.userId);
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
      try {
        const user = await service.activateUser(req.params.userId);
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
      try {
        const user = await service.deactivateUser(req.params.userId);
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
      try {
        const roles = await service.getUserRoles(req.params.userId);
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
      processValidatorResult(validate(req.body, CreateRoleSchema));
      try {
        const response = await service.createRole(req.body.roleName);
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
      try {
        const addUserToRoleRequest = validateAndParse<AddUserToRoleRequest>(
          AddUserToRoleRequestParser,
          req.body
        );
        const response = await service.addUserToRole(addUserToRoleRequest.userId, req.params.roleName);
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
