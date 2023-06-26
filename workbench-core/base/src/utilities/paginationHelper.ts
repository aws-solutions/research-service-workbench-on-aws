/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import { InvalidPaginationTokenError } from '../errors/invalidPaginationTokenError';
import QueryParams from '../interfaces/queryParams';

export function addPaginationToken(
  paginationToken: string | undefined,
  queryParams: QueryParams
): QueryParams {
  const params = { ...queryParams };
  // If paginationToken is defined, add param
  // from: https://notes.serverlessfirst.com/public/How+to+paginate+lists+returned+from+DynamoDB+through+an+API+endpoint#Implementing+this+in+code
  if (paginationToken) {
    params.start = fromPaginationToken(paginationToken);
  }

  return params;
}

export function getPaginationToken(ddbQueryResponse: QueryCommandOutput): string | undefined {
  return ddbQueryResponse.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(ddbQueryResponse.LastEvaluatedKey)).toString('base64')
    : undefined;
}

/**
 * Function to convert an object of key-value string pairs to a pagination token.
 *
 * @param key - object of key-value pairs to convert to a pagination token
 * @returns string of a pagination token
 */
export function toPaginationToken(key: Record<string, string>): string {
  return Buffer.from(JSON.stringify(key)).toString('base64');
}

/**
 * Function to convert a pagination token to an object of key-value string pairs.
 *
 * @param token - pagination token to convert to an object of key-value string pairs
 * @returns object of key-value string pairs
 */
export function fromPaginationToken(token: string): Record<string, string> {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
  } catch {
    throw new InvalidPaginationTokenError(`Invalid Pagination Token`);
  }
}

export const DEFAULT_API_PAGE_SIZE: number = 50;

export const MAX_API_PAGE_SIZE: number = 1000;
