import { Request, Response, NextFunction } from 'express';
import { isBoom } from '@hapi/boom';
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
  if (isBoom(err)) {
    res.status(err.output.statusCode).send(err.output.payload);
  }
  next(err);
};

export const unknownErrorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error('Unhandled Error', err);
  res.status(500).send('Internal server error. Unable to process request');
};
