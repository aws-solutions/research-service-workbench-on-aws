/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../models/authenticatedUser';

/**
 * Request object for DeleteGroup
 */
export interface DeleteGroupRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
  /**
   * Group id being deleted
   */
  groupId: string;
}

/**
 * Response object for DeleteGroup
 */
export interface DeleteGroupResponse {
  /**
   * The data object returned
   */
  data: {
    /**
     * The deleted group ID
     */
    groupId: string;
  };
}
