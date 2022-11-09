/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// User management
import {
  CreateRoleSchema,
  CreateUserSchema,
  Status,
  UpdateRoleSchema,
  UserManagementService,
  UserNotFoundError
} from '@aws/workbench-core-authentication';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import _ from 'lodash';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpUserRoutes(router: Router, user: UserManagementService): void {
  router.post(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateUserSchema));
      const response = await user.createUser(req.body);
      res.status(201).send(response);
    })
  );

  router.get(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      const users = await user.listUsers();
      res.status(200).json({ users });
    })
  );

  router.delete(
    '/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      try {
        const existingUser = await user.getUser(userId);
        if (existingUser.status !== Status.INACTIVE) {
          throw Boom.badRequest(
            `Could not delete user ${userId}. Expected status: ${Status[Status.INACTIVE]}; received: ${
              Status[existingUser.status]
            }`
          );
        }

        await user.deleteUser(userId);
        res.status(204).send();
      } catch (err) {
        if (err instanceof UserNotFoundError) {
          throw Boom.notFound(`Could not find user ${userId}`);
        }

        if (Boom.isBoom(err)) {
          throw err;
        }

        throw Boom.badImplementation(`Could not delete user ${userId}`);
      }
    })
  );

  router.post(
    '/roles',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateRoleSchema));
      const response = await user.createRole(req.body.roleName);
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
      const response = await user.addUserToRole(req.body.username, req.params.roleName);
      res.send(response);
    })
  );
}
