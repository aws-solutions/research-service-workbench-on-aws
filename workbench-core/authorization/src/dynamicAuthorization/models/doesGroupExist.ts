/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DoesGroupExistRequestParser = z.object({
  /**
   * Group id to be checked
   */
  groupId: z.string()
});

/**
 * Request object for DoesGroupExist
 */
export type DoesGroupExistRequest = z.infer<typeof DoesGroupExistRequestParser>;

/**
 * Response object for DoesGroupExist
 */
export interface DoesGroupExistResponse {
  data: {
    /**
     * Describes if group exist
     */
    exist: boolean;
  };
}
