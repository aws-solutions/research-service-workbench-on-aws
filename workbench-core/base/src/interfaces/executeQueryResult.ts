/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '../types/json';

export default interface ExecuteQueryResult {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, JSONValue>[];
  paginationToken?: string;
}
