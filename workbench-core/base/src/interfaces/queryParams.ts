/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface QueryParams {
  index?: string;
  key?: { name: string; value: unknown };
  sortKey?: string;
  eq?: AttributeValue;
  lt?: AttributeValue;
  lte?: AttributeValue;
  gt?: AttributeValue;
  gte?: AttributeValue;
  between?: { value1: AttributeValue; value2: AttributeValue };
  begins?: AttributeValue;
  start?: { [key: string]: unknown };
  filter?: string;
  strong?: boolean;
  names?: { [key: string]: string };
  values?: { [key: string]: unknown }; // unknown?
  projection?: string | string[];
  select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT';
  limit?: number;
  forward?: boolean;
  capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
}

export default QueryParams;
