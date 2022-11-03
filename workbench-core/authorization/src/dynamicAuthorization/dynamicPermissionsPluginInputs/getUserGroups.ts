/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Request object for DynamicPermissionsPlugin's getUserGroups
 */
export interface GetUserGroupsRequest {
  /**
   * User id required for retrieval of groups
   */
  userId: string;
}
/**
 * Response object for DynamicPermissionsPlugin's getUserGroups
 */
export interface GetUserGroupsResponse {
  /**
   * A list of group ids associated to the user
   */
  groupIds: string[];
}
