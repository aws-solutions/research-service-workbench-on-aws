import {
  AuthorizationService,
  DynamicAuthorizationService,
  isForbiddenError
} from '@aws/workbench-core-authorization';
import { validateAndParse } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import { Request, Response, Router } from 'express';
import {
  IsAuthorizedOnRouteRequestParser,
  IsAuthorizedOnRouteRequest
} from '../models/authorization/isAuthorizedOnRoute';
import { IsRouteIgnoredRequest, IsRouteIgnoredRequestParser } from '../models/authorization/isRouteIgnored';
import { wrapAuth } from '../utilities/authWrapper';

export function setupStaticAuthorizationRoutes(
  router: Router,
  dynamicAuthorizationService: DynamicAuthorizationService,
  authorizationService: AuthorizationService
): void {
  router.get(
    '/staticAuthorization/isAuthorizedOnRoute',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      try {
        const authenticatedUser = res.locals.user;
        const validatedRequest = validateAndParse<IsAuthorizedOnRouteRequest>(
          IsAuthorizedOnRouteRequestParser,
          {
            user: authenticatedUser,
            ...req.query
          }
        );
        const { user, route, method } = validatedRequest;
        await authorizationService.isAuthorizedOnRoute(user, route, method);
        res.sendStatus(200);
      } catch (err) {
        console.log(err);
        if (isForbiddenError(err)) {
          throw Boom.forbidden('User is forbidden from accessing this route');
        }
        throw err;
      }
    })
  );

  router.get(
    '/staticAuthorization/isRouteIgnored',
    wrapAuth(dynamicAuthorizationService, async (req: Request, res: Response) => {
      const validatedRequest = validateAndParse<IsRouteIgnoredRequest>(
        IsRouteIgnoredRequestParser,
        req.query
      );
      const { route, method } = validatedRequest;
      const response = await authorizationService.isRouteIgnored(route, method);
      res.status(200).send({ ignored: response });
    })
  );
}
