/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamicOperation } from './dynamicAuthorization/models/dynamicOperation';
import { IdentityPermission } from './dynamicAuthorization/models/identityPermission';
import Operation from './models/operation';
import Permission from './models/permission';

/**
 * Represents an AuthorizationPlugin.
 */
export default interface AuthorizationPlugin {
  /**
   * Checks whether a set of a user's {@link Permission}s is authorized to perform a set of {@link Operation}s.
   * @param userPermissions - {@link Permission}.
   * @param operations - An array of {@link Operation}s that the user wants to perform.
   *
   * @throws - {@link ForbiddenError} when user is not authorized.
   */
  isAuthorized(userPermissions: Permission[], operations: Operation[]): Promise<void>;

  /**
   * Checks whether a set of {@link IdentityPermission}s is authorized to perform a set of {@link DynamicOperation}.
   * @param identityPermissions - {@link IdentityPermission}s.
   * @param dynamicOperations - An array  of {@link DynamicOperation}s that the user wants to perform.
   *
   * @throws - {@link ForbiddenError} when user is not authorized.
   */
  isAuthorizedOnDynamicOperations(
    identityPermissions: IdentityPermission[],
    dynamicOperations: DynamicOperation[]
  ): Promise<void>;
}
