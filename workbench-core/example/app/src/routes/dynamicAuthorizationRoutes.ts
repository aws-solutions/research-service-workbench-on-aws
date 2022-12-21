import { isPluginConfigurationError } from '@aws/workbench-core-authentication';
import {
  DynamicAuthorizationService,
  isGroupAlreadyExistsError,
  isTooManyRequestsError
} from '@aws/workbench-core-authorization';
import {
  CreateGroupRequest,
  CreateGroupRequestParser
} from '@aws/workbench-core-authorization/lib/models/createGroup';
import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Router, Request, Response } from 'express';
import { dynamicAuthorizationService } from '../services/dynamicAuthorizationService';
import { wrapAsync } from '../utilities/errorHandlers';

export function setUpDynamicAuthorizationRoutes(router: Router, service: DynamicAuthorizationService): void {
  router.post(
    '/authorization/group',
    wrapAsync(async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<CreateGroupRequest>(CreateGroupRequestParser, req.body);

      try {
        const { data } = await dynamicAuthorizationService.createGroup({
          authenticatedUser: res.locals.user,
          ...validatedRequest
        });
        res.status(201).send(data);
      } catch (error) {
        if (isGroupAlreadyExistsError(error)) {
          Boom.badRequest('Group already exists');
        } else if (isPluginConfigurationError(error)) {
          Boom.internal('An internal error occurred');
        } else if (isTooManyRequestsError(error)) {
          Boom.tooManyRequests('Too many requests');
        } else {
          throw error;
        }
      }
    })
  );
}
