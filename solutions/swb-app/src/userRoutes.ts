/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// User management
import {
  CreateRoleSchema,
  CreateUserSchema,
  UpdateUserSchema,
  Status,
  UpdateRoleSchema,
  UserManagementService,
  isUserNotFoundError,
  isRoleNotFoundError,
  isInvalidParameterError,
  isUserAlreadyExistsError
} from '@aws/workbench-core-authentication';
import Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import { validate } from 'jsonschema';
import _ from 'lodash';
import { wrapAsync } from './errorHandlers';
import { processValidatorResult } from './validatorHelper';

export function setUpUserRoutes(router: Router, userService: UserManagementService): void {
  router.post(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        processValidatorResult(validate(req.body, CreateUserSchema));
        const response = await userService.createUser(req.body);
        res.status(201).send(response);
      } catch (err) {
        if (isInvalidParameterError(err)) {
          throw Boom.badRequest(`Invalid parameter: ${err.message}`);
        }

        if (isUserAlreadyExistsError(err)) {
          throw Boom.conflict(`User with this email already exist.`);
        }

        if (Boom.isBoom(err)) {
          throw err;
        }

        throw Boom.badImplementation(`Could not find create user`);
      }
    })
  );

  router.get(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      const users = await userService.listUsers();
      res.status(200).json({ users });
    })
  );

  router.get(
    '/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      try {
        const user = await userService.getUser(userId);
        res.status(200).json(user);
      } catch (err) {
        if (isUserNotFoundError(err)) throw Boom.notFound(`Could not find user ${userId}`);
        if (Boom.isBoom(err)) throw err;
        throw Boom.badImplementation(`Could not find user ${userId}`);
      }
    })
  );

  router.delete(
    '/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      try {
        const existingUser = await userService.getUser(userId);
        if (existingUser.status !== Status.INACTIVE) {
          throw Boom.badRequest(
            `Could not delete user ${userId}. Expected status: ${Status[Status.INACTIVE]}; received: ${
              Status[existingUser.status]
            }`
          );
        }

        await userService.deleteUser(userId);
        res.status(204).send();
      } catch (err) {
        if (isUserNotFoundError(err)) throw Boom.notFound(`Could not find user ${userId}`);
        if (Boom.isBoom(err)) throw err;
        throw Boom.badImplementation(`Could not delete user ${userId}`);
      }
    })
  );

  router.patch(
    '/users/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, UpdateUserSchema));
      const userId = req.params.userId;
      try {
        const existingUser = await userService.getUser(userId);

        if (!_.isUndefined(req.body.status)) {
          if (req.body.status === 'ACTIVE' && existingUser.status === Status.INACTIVE)
            await userService.activateUser(userId);
          if (req.body.status === 'INACTIVE' && existingUser.status === Status.ACTIVE)
            await userService.deactivateUser(userId);
          delete req.body.status; // Status update is complete, and type is different than expected for further steps
        }

        if (!_.isEmpty(req.body.roles) && !_.isEqual(existingUser.roles, req.body.roles)) {
          const rolesToAdd = _.difference(req.body.roles, existingUser.roles);
          await Promise.all(
            _.map(rolesToAdd, async (role) => {
              await userService.addUserToRole(userId, role);
            })
          );
          const rolesToRemove = _.difference(existingUser.roles, req.body.roles);
          await Promise.all(
            _.map(rolesToRemove, async (role) => {
              await userService.removeUserFromRole(userId, role);
            })
          );
        }

        // Since updateUser() requires object of type User
        await userService.updateUser(userId, { ...existingUser, ...req.body });
        res.status(204).send();
      } catch (err) {
        if (isUserNotFoundError(err)) throw Boom.notFound(`Could not find user ${userId}`);
        if (isRoleNotFoundError(err))
          throw Boom.notFound(
            'Please make sure all specified roles exist as groups in the Cognito User Pool'
          );
        if (isInvalidParameterError(err))
          throw Boom.notFound(
            'Please make sure specified email is in valid email format and not already in use in the Cognito User Pool'
          );
        if (Boom.isBoom(err)) throw err;
        throw Boom.badImplementation(`Could not update user ${userId}`);
      }
    })
  );

  router.post(
    '/roles',
    wrapAsync(async (req: Request, res: Response) => {
      processValidatorResult(validate(req.body, CreateRoleSchema));
      const response = await userService.createRole(req.body.roleName);
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
      const response = await userService.addUserToRole(req.body.username, req.params.roleName);
      res.send(response);
    })
  );
}
