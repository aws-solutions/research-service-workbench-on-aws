/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryParams } from '@amzn/workbench-core-base';
import { QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';

export function addPaginationToken(
  paginationToken: string | undefined,
  queryParams: QueryParams
): QueryParams {
  const params = { ...queryParams };
  // If paginationToken is defined, add param
  // from: https://notes.serverlessfirst.com/public/How+to+paginate+lists+returned+from+DynamoDB+through+an+API+endpoint#Implementing+this+in+code
  if (paginationToken) {
    try {
      params.start = JSON.parse(Buffer.from(paginationToken, 'base64').toString('utf8'));
    } catch (error) {
      throw Boom.badRequest('Invalid paginationToken');
    }
  }

  return params;
}

export function getPaginationToken(ddbQueryResponse: QueryCommandOutput): string | undefined {
  return ddbQueryResponse.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(ddbQueryResponse.LastEvaluatedKey)).toString('base64')
    : undefined;
}

export const DEFAULT_API_PAGE_SIZE: number = 50;
