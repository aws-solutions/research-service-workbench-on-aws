import { HTTPMethod } from '../../routesMap';

/**
 * Request object for IsRouteProtected
 */
export interface IsRouteProtectedRequest {
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
 * Response object for IsRouteProtected
 */
export interface IsRouteProtectedResponse {
  /**
   * Describes if route is protected
   */
  routeProtected: boolean;
}
