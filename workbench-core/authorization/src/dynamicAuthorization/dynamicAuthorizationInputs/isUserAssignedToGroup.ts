/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../authenticatedUser';

/**
 * Request object for IsUserAssignedToGroup
 */
export interface IsUserAssignedToGroupRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;

  /**
   * User id to be checked
   */
  userId: string;

  /**
   * Group id to be checked
   */
  groupId: string;
}

/**
 * Response object for IsUserAssignedToGroup
 */
export interface IsUserAssignedToGroupResponse {
  /**
   * Describes if user assigned to group
   */
  isAssigned: boolean;
}
