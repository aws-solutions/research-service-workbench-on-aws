/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export default interface PaginatedResponse<T> {
  data: T[];
  paginationToken?: string;
}
