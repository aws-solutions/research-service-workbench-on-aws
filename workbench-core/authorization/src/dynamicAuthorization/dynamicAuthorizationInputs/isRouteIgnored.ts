import { HTTPMethod } from '../../routesMap';

/**
 * Request object for IsRouteIgnored
 */
export interface IsRouteIgnoredRequest {
  /**
   * Route being checked
   */
  route: string;

  /**
   * {@link HTTPMethod}
   */
  method: HTTPMethod;
}
/**
 * Response object for IsRouteIgnored
 */
export interface IsRouteIgnoredResponse {
  /**
   * Describes if route is ignored
   */
  routeIgnored: boolean;
}
