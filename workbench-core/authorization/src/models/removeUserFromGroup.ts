/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Request object for DynamicPermissionsPlugin's removeUserFromGroup
 */
export interface RemoveUserFromGroupRequest {
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
 * Response object for DynamicPermissionsPlugin's removeUserFromGroup
 */
export interface RemoveUserFromGroupResponse {
  /**
   * States whether the user was successfully removed from group
   */
  removed: boolean;
}
