import { DynamicAuthorizationService } from '@aws/workbench-core-authorization';
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

      const { created } = await dynamicAuthorizationService.createGroup({
        authenticatedUser: res.locals.user,
        ...validatedRequest
      });

      if (created) {
        res.sendStatus(201);
      } else {
        Boom.badRequest('Could not create the group.');
      }
    })
  );
}
