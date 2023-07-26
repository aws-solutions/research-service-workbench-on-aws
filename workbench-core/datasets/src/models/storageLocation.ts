/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const StorageLocationParser = z.object({
  /**
   * a string which identifies the storage specific location such the URL to an S3 bucket.
   */
  name: z.string(),

  /**
   * storage type of the StorageLocation
   */
  type: z.string(),

  /**
   * AWS Account ID of the StorageLocation
   */
  awsAccountId: z.string().optional(),

  /**
   * AWS region of the StorageLocation
   */
  region: z.string().optional()
});

export type StorageLocation = z.infer<typeof StorageLocationParser>;

// eslint-disable-next-line @rushstack/typedef-var
export const StorageLocationArrayParser = z.array(StorageLocationParser);
