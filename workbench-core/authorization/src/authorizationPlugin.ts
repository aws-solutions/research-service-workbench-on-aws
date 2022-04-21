// TODO:
import { User } from '@amzn/workbench-core-authentication';

// define whether the authorization plugin needs to digest the permissions plugin
export default interface AuthorizationPlugin {
  // TODO: can activate on what? Method? Instance? Handler?
  // define this into better componets and make it easier to digest
  // Should there be a set of permissions based
  canActivate(user: User): Promise<boolean>;
}
