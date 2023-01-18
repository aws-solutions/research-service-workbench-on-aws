/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { SetGroupStatus } from '../models/SetGroupMetadata';

/**
 * Request object for SetGroupStatus
 */
export interface SetGroupStatusRequest {
  /**
   * Group id associated to the group the status is being set on
   */
  groupId: string;
  /**
   *  {@link GroupStatus} to set
   */
  status: SetGroupStatus;
}
/**
 * Response object for SetGroupStatus
 */
export interface SetGroupStatusResponse {
  /**
   * The data object returned
   */
  data: {
    /**
     * The set status
     */
    status: SetGroupStatus;
  };
}
