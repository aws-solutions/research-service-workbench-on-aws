/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamicAuthorizationService, HTTPMethodParser } from '@aws/workbench-core-authorization';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wrapAuth = (
  dynamicAuthorizationService: DynamicAuthorizationService,
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  // eslint-disable-next-line func-names
  const wrapper: (req: Request, res: Response, next: NextFunction) => Promise<void> = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const params = req.params;
    const route: string = req.baseUrl + req.path;
    const authenticatedUser = res.locals.user;
    const method = HTTPMethodParser.parse(req.method);
    try {
      await dynamicAuthorizationService.isAuthorizedOnRoute({
        params,
        route,
        method,
        authenticatedUser
      });
      fn(req, res, next).catch(next);
    } catch (err) {
      res.status(403).send();
    }
  };

  return wrapper;
};
