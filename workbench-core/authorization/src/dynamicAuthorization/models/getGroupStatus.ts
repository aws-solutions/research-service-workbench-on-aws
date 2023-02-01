/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetGroupStatus } from '../models/GetGroupMetadata';

/**
 * Request object for GetGroupStatus
 */
export interface GetGroupStatusRequest {
  /**
   * Group id associated to the group the status is being retrieved for
   */
  groupId: string;
}
/**
 * Response object for SetGroupStatus
 */
export interface GetGroupStatusResponse {
  /**
   * The data object returned
   */
  data: {
    /**
     * The group {@link GroupStatus}
     */
    status: GetGroupStatus;
  };
}
