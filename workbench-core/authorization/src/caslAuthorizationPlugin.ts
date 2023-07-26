/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  Ability,
  AbilityBuilder,
  ForbiddenError as CASLForbiddenError,
  subject as Subject
} from '@casl/ability';
import _ from 'lodash';
import AuthorizationPlugin from './authorizationPlugin';
import { DynamicOperation } from './dynamicAuthorization/models/dynamicOperation';
import { IdentityPermission } from './dynamicAuthorization/models/identityPermission';
import { ForbiddenError } from './errors/forbiddenError';
import Operation from './models/operation';
import Permission from './models/permission';
/**
 * {@link https://github.com/stalniy/casl | CASL } Authorization Plugin.
 *
 */
export default class CASLAuthorizationPlugin implements AuthorizationPlugin {
  public async isAuthorized(userPermissions: Permission[], operations: Operation[]): Promise<void> {
    const ability: Ability = this._defineAbilitiesForUserPermissions(userPermissions);
    try {
      operations.forEach((operation: Operation) => {
        CASLForbiddenError.from(ability).throwUnlessCan(operation.action, operation.subject, operation.field);
      });
    } catch (err) {
      throw new ForbiddenError(err.message);
    }
  }

  public async isAuthorizedOnDynamicOperations(
    identityPermissions: IdentityPermission[],
    dynamicOperations: DynamicOperation[]
  ): Promise<void> {
    const ability: Ability = this._defineAbilitiesForIdentityPermissions(identityPermissions);
    try {
      dynamicOperations.forEach((dynamicOperation: DynamicOperation) => {
        const { subject } = dynamicOperation;
        const attributes = {
          ..._.omit(subject, 'subjectType')
        };
        const requestedSubject = Subject(subject.subjectType, attributes);
        CASLForbiddenError.from(ability).throwUnlessCan(
          dynamicOperation.action,
          requestedSubject,
          dynamicOperation.field
        );
      });
    } catch (err) {
      throw new ForbiddenError(err.message);
    }
  }
  /**
   * Given a set of a user's {@link  Permission}s, an CASL {@link Ability} is created.
   * @param userPermissions - a set of a user's {@link Permission}s.
   * @returns a CASL {@link Ability}.
   */
  private _defineAbilitiesForUserPermissions(userPermissions: Permission[]): Ability {
    const { can, cannot, rules } = new AbilityBuilder(Ability);
    const allowPermissions: Permission[] = [];
    const denyPermissions: Permission[] = [];

    userPermissions.forEach((permission: Permission) => {
      if (permission.effect === 'ALLOW') allowPermissions.push(permission);
      else if (permission.effect === 'DENY') denyPermissions.push(permission);
    });
    //Ordering of permissions matters in CASL
    allowPermissions.forEach((permission: Permission) => {
      can(permission.action, permission.subject, permission.fields);
    });
    //Override allows with denys, prioritizing DENY
    denyPermissions.forEach((permission: Permission) => {
      const reason: string = permission.reason ?? 'Permission Not Granted';
      cannot(permission.action, permission.subject, permission.fields).because(reason);
    });
    return new Ability(rules);
  }

  /**
   * Given a set of {@link IdentityPermission}s, a CASL {@link Ability} is created.
   * @param identityPermissions - a set of {@link IdentityPermission}s.
   * @returns a CASL {@link Ability}
   */
  private _defineAbilitiesForIdentityPermissions(identityPermissions: IdentityPermission[]): Ability {
    const { can, cannot, rules } = new AbilityBuilder(Ability);

    const allowIdentityPermissions: IdentityPermission[] = [];
    const denyIdentityPermissions: IdentityPermission[] = [];

    identityPermissions.forEach((identityPermission: IdentityPermission) => {
      if (identityPermission.effect === 'ALLOW') allowIdentityPermissions.push(identityPermission);
      else if (identityPermission.effect === 'DENY') denyIdentityPermissions.push(identityPermission);
    });

    allowIdentityPermissions.forEach((identityPermission: IdentityPermission) => {
      const conditions = {
        ...(identityPermission.conditions ?? {}),
        //wildcards do not count as a condition
        ...(identityPermission.subjectId === '*' ? {} : { subjectId: identityPermission.subjectId })
      };
      can(identityPermission.action, identityPermission.subjectType, identityPermission.fields, conditions);
    });

    denyIdentityPermissions.forEach((identityPermission: IdentityPermission) => {
      const conditions = {
        ...(identityPermission.conditions ?? {}),
        //wildcards do not count as a condition
        ...(identityPermission.subjectId === '*' ? {} : { subjectId: identityPermission.subjectId })
      };
      cannot(
        identityPermission.action,
        identityPermission.subjectType,
        identityPermission.fields,
        conditions
      );
    });
    return new Ability(rules);
  }
}
