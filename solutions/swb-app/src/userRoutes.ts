/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { validateAndParse } from '@aws/workbench-core-base';
import {
  Status,
  UserManagementService,
  isUserNotFoundError,
  isRoleNotFoundError,
  isInvalidParameterError,
  isUserAlreadyExistsError
} from '@aws/workbench-core-user-management';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import _ from 'lodash';
import { wrapAsync } from './errorHandlers';
import { CreateRoleRequest, CreateRoleRequestParser } from './users/createRoleRequest';
import { CreateUserRequest, CreateUserRequestParser } from './users/createUserRequest';
import { DeleteUserRequest, DeleteUserRequestParser } from './users/deleteUserRequest';
import { GetUserRequest, GetUserRequestParser } from './users/getUserRequest';
import { UpdateRoleRequest, UpdateRoleRequestParser } from './users/updateRoleRequest';
import { UpdateUserRequest, UpdateUserRequestParser } from './users/updateUserRequest';

export function setUpUserRoutes(router: Router, userService: UserManagementService): void {
  router.post(
    '/users',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const validatedRequest = validateAndParse<CreateUserRequest>(CreateUserRequestParser, {
          ...req.body
        });

        const response = await userService.createUser(validatedRequest);
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

        throw Boom.badImplementation(`Could not create user`);
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
      const validatedRequest = validateAndParse<GetUserRequest>(GetUserRequestParser, {
        userId: req.params.userId
      });
      const { userId } = validatedRequest;
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
    '/users/:userId/purge',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<DeleteUserRequest>(DeleteUserRequestParser, {
        userId: req.params.userId
      });
      const { userId } = validatedRequest;
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
      const updateUserRequest = validateAndParse<UpdateUserRequest>(UpdateUserRequestParser, {
        ...req.body,
        userId: req.params.userId
      });

      const { userId, status, roles, ...rest } = updateUserRequest;
      try {
        const existingUser = await userService.getUser(userId);

        if (!_.isUndefined(status)) {
          if (status === 'ACTIVE' && existingUser.status === Status.INACTIVE)
            await userService.activateUser(userId);
          if (status === 'INACTIVE' && existingUser.status === Status.ACTIVE)
            await userService.deactivateUser(userId);
        }

        if (!_.isEmpty(roles) && !_.isEqual(existingUser.roles, roles)) {
          const rolesToAdd = _.difference(roles, existingUser.roles);
          await Promise.all(
            _.map(rolesToAdd, async (role) => {
              await userService.addUserToRole(userId, role);
            })
          );
          const rolesToRemove = _.difference(existingUser.roles, roles ?? []);
          await Promise.all(
            _.map(rolesToRemove, async (role) => {
              await userService.removeUserFromRole(userId, role);
            })
          );
        }

        // Since updateUser() requires object of type User
        await userService.updateUser(userId, { ...existingUser, ...rest });
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
}
