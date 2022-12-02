/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface UpdateParams {
  key: { [key: string]: unknown };
  params?: {
    disableCreatedAt?: boolean;
    disableUpdatedAt?: boolean;
    item?: { [key: string]: unknown };
    set?: string;
    add?: string;
    remove?: string | string[];
    delete?: string;
    names?: { [key: string]: string };
    values?: { [key: string]: unknown };
    return?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
    metrics?: 'NONE' | 'SIZE';
    capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
  };
}
