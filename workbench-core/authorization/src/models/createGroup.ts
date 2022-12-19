/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * Request object for DynamicPermissionsPlugin's createGroup
 */
export interface CreateGroupRequest {
  /**
   * GroupID being created
   * GroupID must be unique
   */
  groupId: string;

  /**
   * Description of group
   */
  description?: string;
}

/**
 * Response object for DynamicPermissionsPlugin's createGroup
 */
export interface CreateGroupResponse {
  /**
   * States whether the group was successfully created
   */
  created: boolean;
}
