/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// User management
import {
  CreateRoleSchema,
  CreateUserSchema,
  isInvalidParameterError,
  isUserAlreadyExistsError,
  isUserNotFoundError,
  UpdateRoleSchema,
  UserManagementService
} from '@aws/workbench-core-user-management';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import _ from 'lodash';
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
        throw e;
      }
    })
  );

  router.get(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      const users = await service.listUsers();
      res.status(200).json(users);
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
        throw e;
      }
    })
  );

  router.post(
    '/roles',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateRoleSchema));
      const response = await service.createRole(req.body.roleName);
      res.status(201).send(response);
    })
  );

  router.put(
    '/roles/:roleName',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, UpdateRoleSchema));
      if (!_.isString(req.params.roleName)) {
        throw Boom.badRequest('roleName must be a string.');
      }
      const response = await service.addUserToRole(req.body.username, req.params.roleName);
      res.send(response);
    })
  );
}
