/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../models/authenticatedUser';

/**
 * Request object for GetGroupUsers
 */
export interface GetGroupUsersRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
  /**
   * Group id required for retrieval of users
   */
  groupId: string;
}
/**
 * Response object for GetGroupUsers
 */
export interface GetGroupUsersResponse {
  /**
   * The data object returned
   */
  data: {
    /**
     * A list of user ids associated to the group
     */
    userIds: string[];
  };
}
