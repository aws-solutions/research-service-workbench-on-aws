/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const ValidateUserGroupsRequestParser = z.object({
  /**
   * User ID being validated
   */
  userId: z.string().userId().required(),
  /**
   * Array of group IDs being validated
   */
  groupIds: z.array(z.string())
});

/**
 * Request object for ValidateUserGroups
 */
export type ValidateUserGroupsRequest = z.infer<typeof ValidateUserGroupsRequestParser>;

/**
 * Response object for ValidateUserGroups
 */
export interface ValidateUserGroupsResponse {
  validGroupIds: string[];
}
