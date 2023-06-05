/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ConsumedCapacity, ItemCollectionMetrics } from '@aws-sdk/client-dynamodb';

export interface UpdateUnmarshalledOutput {
  Attributes?: Record<string, string>;
  ConsumedCapacity?: ConsumedCapacity;
  ItemCollectionMetrics?: ItemCollectionMetrics;
}
