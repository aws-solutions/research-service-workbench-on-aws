/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export default interface ExecuteQueryResult {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  paginationToken?: string;
}
