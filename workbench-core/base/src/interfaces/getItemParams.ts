/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

interface GetItemParams {
  key: { [key: string]: unknown };
  params?: {
    strong?: boolean;
    names?: { [key: string]: string };
    projection?: string | string[];
    capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
  };
}

export default GetItemParams;
