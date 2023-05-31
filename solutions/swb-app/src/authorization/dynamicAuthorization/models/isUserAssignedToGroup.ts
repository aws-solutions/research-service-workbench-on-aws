/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../models/authenticatedUser';

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
   * The data object returned
   */
  data: {
    /**
     * Describes if the user assigned to the group
     */
    isAssigned: boolean;
  };
}
