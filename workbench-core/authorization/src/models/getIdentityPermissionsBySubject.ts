/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Action } from '../action';
import { Identity, IdentityPermission } from './identityPermission';

/**
 * Request object for DynamicPermissionsPlugin's getIdentityPermissionsBySubject
 */
export interface GetIdentityPermissionsBySubjectRequest {
  /**
   * SubjectType associated to the {@link IdentityPermission}s
   */
  subjectType: string;
  /**
   * Subject id associated to the subject
   */
  subjectId: string;
  /**
   * Filter by {@link Action}
   */
  action?: Action;
  /**
   * Filter by identities
   */
  identities?: Identity[];
}

/**
 * Response object for DynamicPermissionsPlugin's getIdentityPermissionsBySubject
 */
export interface GetIdentityPermissionsBySubjectResponse {
  /**
   * An array of {@link IdentityPermission} associated to the subject
   */
  identityPermissions: IdentityPermission[];
}
