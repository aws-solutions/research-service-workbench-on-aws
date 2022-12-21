/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Action } from '../../action';
import { AuthenticatedUser } from '../../authenticatedUser';
import { Identity, IdentityPermission } from './identityPermission';

/**
 * Request object for GetIdentityPermissionsBySubject
 */
export interface GetIdentityPermissionsBySubjectRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
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
 * Response object for GetIdentityPermissionsBySubject
 */
export interface GetIdentityPermissionsBySubjectResponse {
  /**
   * An array of {@link IdentityPermission} associated to the subject
   */
  identityPermissions: IdentityPermission[];
}
