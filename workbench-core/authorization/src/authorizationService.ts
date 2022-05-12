import { User } from '@amzn/workbench-core-authentication';
import AuthorizationPlugin from './authorizationPlugin';
import PermissionsPlugin from './permissionsPlugin';
import { HTTPMethod } from './routesMap';

/**
 * Authorization Service.
 */
export default class AuthorizationService {
  private _authorizationPlugin: AuthorizationPlugin;
  private _permissionsPlugin: PermissionsPlugin;
  /**
   * Authorization Service constructor.
   * @param authorizationPlugin - {@link AuthorizationPlugin}.
   * @param permissionsPlugin - {@link PermissionsPlugin}.
   */
  public constructor(authorizationPlugin: AuthorizationPlugin, permissionsPlugin: PermissionsPlugin) {
    this._authorizationPlugin = authorizationPlugin;
    this._permissionsPlugin = permissionsPlugin;
  }

  /**
   * Checks whether a {@link User} is authorized to utilize a {@link HTTPMethod} on a route.
   * @param user - {@link User}.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   */
  public async isAuthorizedOnRoute(user: User, route: string, method: HTTPMethod): Promise<void> {
    throw new Error('Method not implemented');
  }
}
