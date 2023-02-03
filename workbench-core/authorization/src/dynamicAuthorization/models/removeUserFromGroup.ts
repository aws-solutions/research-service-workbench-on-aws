/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../models/authenticatedUser';

/**
 * Request object for RemoveUserFromGroup
 */
export interface RemoveUserFromGroupRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
  /**
   * User id associated to the user being removed from group
   */
  userId: string;
  /**
   * Group id associated to the group the user is being removed from
   */
  groupId: string;
}
/**
 * Response object for RemoveUserFromGroup
 */
export interface RemoveUserFromGroupResponse {
  /**
   * The data object returned
   */
  data: {
    /**
     * User id associated to user that was removed from the group
     */
    userId: string;
    /**
     * Group id associated to the group where user was removed from
     */
    groupId: string;
  };
}
