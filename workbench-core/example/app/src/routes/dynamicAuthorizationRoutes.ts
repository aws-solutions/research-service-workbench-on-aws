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
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityRequestParser,
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectRequestParser,
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsRequestParser,
  isRetryError,
  IsRouteProtectedRequest,
  IsRouteProtectedRequestParser,
  IsRouteIgnoredRequest,
  IsRouteIgnoredRequestParser,
  IsAuthorizedOnSubjectRequest,
  isForbiddenError,
  IsAuthorizedOnSubjectRequestParser,
  DoesGroupExistRequest,
  DoesGroupExistRequestParser,
  DeleteSubjectIdentityPermissionsRequest,
  DeleteSubjectIdentityPermissionsRequestParser
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
        if (isTooManyRequestsError(error)) {
          throw Boom.tooManyRequests(error.message);
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
        if (isTooManyRequestsError(error)) {
          throw Boom.tooManyRequests(error.message);
        }
        throw error;
      }
    })
  );

  router.delete(
    '/authorization/groups/:groupId',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const response = await service.deleteGroup({
          groupId: req.params.groupId,
          authenticatedUser: res.locals.user
        });

        res.status(200).send(response.data);
      } catch (error) {
        if (isGroupNotFoundError(error) || isForbiddenError(error)) {
          throw Boom.notFound(error.message);
        }
        if (isRetryError(error)) {
          throw Boom.serverUnavailable('Failed to delete group permissions. Please request a retry');
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
        if (isTooManyRequestsError(error)) {
          throw Boom.tooManyRequests(error.message);
        }
        throw error;
      }
    })
  );

  router.get(
    '/authorization/groups/:groupId/get-users',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const { data } = await service.getGroupUsers({
          authenticatedUser: res.locals.user,
          groupId: req.params.groupId
        });
        res.status(200).send(data);
      } catch (error) {
        if (isGroupNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        if (isTooManyRequestsError(error)) {
          throw Boom.tooManyRequests(error.message);
        }
        throw error;
      }
    })
  );

  router.get(
    '/authorization/groups/:groupId/is-user-assigned/:userId',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const { data } = await service.isUserAssignedToGroup({
          authenticatedUser: res.locals.user,
          userId: req.params.userId,
          groupId: req.params.groupId
        });
        res.status(200).send(data);
      } catch (error) {
        if (isUserNotFoundError(error)) {
          throw Boom.notFound(error.message);
        }
        if (isTooManyRequestsError(error)) {
          throw Boom.tooManyRequests(error.message);
        }
        throw error;
      }
    })
  );
  router.get(
    '/authorization/groups/:groupId/does-group-exist',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<DoesGroupExistRequest>(DoesGroupExistRequestParser, {
        groupId: req.params.groupId
      });
      const { data } = await service.doesGroupExist(validatedRequest);
      res.status(200).send(data);
    })
  );
  router.post(
    '/authorization/permissions',
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
    '/authorization/permissions/identity',
    wrapAsync(async (req: Request, res: Response) => {
      const query = {
        ...req.query,
        limit: req.query.limit && typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined
      };
      const validatedRequest = validateAndParse<GetIdentityPermissionsByIdentityRequest>(
        GetIdentityPermissionsByIdentityRequestParser,
        query
      );
      const response = await service.getIdentityPermissionsByIdentity(validatedRequest);
      res.status(200).send(response);
    })
  );
  router.get(
    '/authorization/permissions/subject',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        if (req.query && req.query.identities) {
          const identities: string[] = req.query.identities as string[];
          req.query.identities = identities.map((identity) => JSON.parse(identity));
        }
        const query = {
          ...req.query,
          limit:
            req.query.limit && typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined
        };
        const validatedRequest = validateAndParse<GetIdentityPermissionsBySubjectRequest>(
          GetIdentityPermissionsBySubjectRequestParser,
          query
        );
        const response = await service.getIdentityPermissionsBySubject(validatedRequest);
        res.status(200).send(response);
      } catch (err) {
        if (isThroughputExceededError(err)) throw Boom.tooManyRequests('Too many identities');
        throw err;
      }
    })
  );
  router.delete(
    '/authorization/permissions/subject',
    wrapAsync(async (req: Request, res: Response) => {
      const authenticatedUser = res.locals.user;
      const validatedRequest = validateAndParse<DeleteSubjectIdentityPermissionsRequest>(
        DeleteSubjectIdentityPermissionsRequestParser,
        {
          ...req.body,
          authenticatedUser
        }
      );
      const { data } = await service.deleteSubjectIdentityPermissions(validatedRequest);
      res.status(201).send(data);
    })
  );

  router.delete(
    '/authorization/permissions',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        const authenticatedUser = res.locals.user;
        const validatedRequest = validateAndParse<DeleteIdentityPermissionsRequest>(
          DeleteIdentityPermissionsRequestParser,
          {
            ...req.body,
            authenticatedUser
          }
        );
        const { data } = await service.deleteIdentityPermissions(validatedRequest);
        res.status(200).send(data);
      } catch (err) {
        if (isThroughputExceededError(err))
          throw Boom.tooManyRequests('Exceed limit on deletion of permissions');
        if (isRetryError(err)) throw Boom.serverUnavailable('Request a retry');
        throw err;
      }
    })
  );

  router.get(
    '/authorization/routes/protected',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<IsRouteProtectedRequest>(
        IsRouteProtectedRequestParser,
        req.query
      );
      const { data } = await service.isRouteProtected(validatedRequest);
      res.status(200).send(data);
    })
  );

  router.get(
    '/authorization/routes/ignored',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<IsRouteIgnoredRequest>(
        IsRouteIgnoredRequestParser,
        req.query
      );
      const { data } = await service.isRouteIgnored(validatedRequest);
      res.status(200).send(data);
    })
  );

  router.get(
    '/authorization/authorize/subject',
    wrapAsync(async (req: Request, res: Response) => {
      try {
        req.query.authenticatedUser = JSON.parse(req.query.authenticatedUser as string);
        req.query.dynamicOperation = JSON.parse(req.query.dynamicOperation as string);
        const validatedRequest = validateAndParse<IsAuthorizedOnSubjectRequest>(
          IsAuthorizedOnSubjectRequestParser,
          req.query
        );
        await service.isAuthorizedOnSubject(validatedRequest);
        res.status(204).send();
      } catch (err) {
        if (isForbiddenError(err)) {
          throw Boom.forbidden('User is not authorized');
        }
        throw err;
      }
    })
  );
}
