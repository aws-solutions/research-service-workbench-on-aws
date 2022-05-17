import { Ability, AbilityBuilder, ForbiddenError } from '@casl/ability';
import AuthorizationPlugin from './authorizationPlugin';
import { Operation, Permission } from './permissionsPlugin';
/**
 * {@link https://github.com/stalniy/casl | CASL } Authorization Plugin.
 *
 */
export default class CASLAuthorizationPlugin implements AuthorizationPlugin {
  public async isAuthorized(userPermissions: Permission[], operations: Operation[]): Promise<void> {
    const ability: Ability = this._defineAbilitiesFor(userPermissions);

    operations.forEach((operation: Operation) => {
      ForbiddenError.from(ability).throwUnlessCan(operation.action, operation.subject, operation.field);
    });
  }
  /**
   * Given a set of a user's {@link  Permission}s, an CASL {@link Ability} is created.
   * @param userPermissions - a set of a user's {@link Permission}s.
   * @returns a CASL {@link Ability}.
   */
  private _defineAbilitiesFor(userPermissions: Permission[]): Ability {
    const { can, cannot, rules } = new AbilityBuilder(Ability);

    userPermissions.forEach((permission: Permission) => {
      const reason: string = permission.reason ?? 'Permission Not Granted';
      if (permission.effect === 'ALLOW') can(permission.action, permission.subject, permission.fields);
      else cannot(permission.action, permission.subject, permission.fields).because(reason);
    });
    return new Ability(rules);
  }
}
