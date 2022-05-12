import Operation from './operation';

/**
 * HTTP methods.
 */
export enum HTTPMethod {
  GET = 'GET',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE'
}

/**
 * Maps {@link HTTPMethod} to a set of {@link Operation}s.
 */
export type MethodToOperations = {
  [httpMethod in HTTPMethod]?: Operation[];
};

/**
 * Routes that should be ignored by Authorization.
 */
export interface RoutesIgnored {
  [route: string]: {
    [httpMethod in HTTPMethod]?: boolean;
  };
}
/**
 * Maps a Route to a {@link MethodToOperations}
 *
 * @example
 * ```
 * const routeMap:RouteMap = {
 *  '/sample': {
 *      GET: [
 *        {
 *        action: Action.UPDATE,
 *        subject: 'Sample'
 *        }
 *    ]
 *  }
 * }
 * ```
 */
export default interface RoutesMap {
  [route: string]: MethodToOperations;
}
