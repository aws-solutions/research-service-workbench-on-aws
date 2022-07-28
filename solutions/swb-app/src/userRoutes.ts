/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// User management
import {
  CreateRoleSchema,
  CreateUserSchema,
  UpdateRoleSchema,
  UserManagementService
} from '@amzn/workbench-core-authentication';
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
      const userIds = await user.listUsers();
      const users: Array<object> = [];
      userIds.forEach((userId: string) => {
        users.push({ id: userId });
      });
      res.status(200).json({ users: users });
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
