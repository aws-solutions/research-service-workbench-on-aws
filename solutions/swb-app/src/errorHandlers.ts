/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as Boom from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';
// Followed this tutorial https://scoutapm.com/blog/express-error-handling and https://stackoverflow.com/a/51391081/14310364
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wrapAsync = (fn: any): any => {
  // eslint-disable-next-line func-names
  return function (req: Request, res: Response, next: NextFunction) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const boomErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  if (err.isBoom) {
    delete err.output.payload.statusCode;
    res.status(err.output.statusCode).send(err.output.payload);
  } else {
    next(err);
  }
};

export const unknownErrorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error('Unhandled Error:', err);
  const internalError = Boom.internal('Internal server error. Unable to process request');
  res.status(internalError.output.statusCode).send(internalError.output.payload);
};
