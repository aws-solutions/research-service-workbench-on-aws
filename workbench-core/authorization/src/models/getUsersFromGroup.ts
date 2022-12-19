/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Request object for DynamicPermissionsPlugin's getUsersFromGroup
 */
export interface GetUsersFromGroupRequest {
  /**
   * Group id required for retrieval of users
   */
  groupId: string;
}
/**
 * Response object for DynamicPermissionsPlugin's getUsersFromGroup
 */
export interface GetUsersFromGroupResponse {
  /**
   * A list of user ids associated to the group
   */
  userIds: string[];
}
