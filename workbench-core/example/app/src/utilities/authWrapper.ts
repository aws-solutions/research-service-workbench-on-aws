/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamicAuthorizationService, HTTPMethodParser } from '@aws/workbench-core-authorization';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wrapAuth = (fn: any, dynamicAuthorizationService: DynamicAuthorizationService): any => {
  // eslint-disable-next-line func-names
  return async function (req: Request, res: Response, next: NextFunction) {
    const params = req.params;
    const route = req.originalUrl;
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
};
