/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import { QueryParams } from '../aws/helpers/dynamoDB/dynamoDBService';
import { QueryParameterFilter } from '../interfaces/queryParameterFilter';

/************************************************************
 * Validates only one sorting or filter in list requests
 * @param filter - filter request object
 * @param sort - sorting request object
 ************************************************************/
export function validateSingleSortAndFilter(filter?: {}, sort?: {}): void {
  if (filter && sort) {
    throw Boom.badRequest('Cannot apply a filter and sort at the same time');
  }
  const filterAttributesLength = filter ? Object.keys(filter).length : 0;
  // Check that at most one filter is defined because we not support more than one filter
  if (filterAttributesLength > 1) {
    throw Boom.badRequest('Cannot apply more than one filter.');
  }
  // Check that at most one sort attribute is defined because we not support sorting by more than one attribute
  if (sort && Object.keys(sort).length > 1) {
    throw Boom.badRequest('Cannot sort by more than one attribute.');
  }
}

/************************************************************
 * Parses Object with format \{ field: \{ operator: value \} \} into QueryParam object consumed by dynamoDB
 *
 * @param filter - filter request object field
 * @param sortKey - field name in dynamoDB
 * @param gsi - gsi to use for filter
 *
 * @returns QueryParams object
 ************************************************************/
export function parseQueryParamFilter<T>(
  filter: QueryParameterFilter<T> | undefined,
  sortKey: string,
  gsi: string
): QueryParams | undefined {
  if (!filter || Object.keys(filter).length === 0 || Object.keys(filter).length > 1) {
    return undefined;
  }
  if (filter?.between && filter.between.value1 && filter.between.value2) {
    const filterProperty = getFilterPropertyByType(filter.between.value1);
    const value1 = { [filterProperty]: filter.between.value1 } as unknown as AttributeValue;
    const value2 = { [filterProperty]: filter.between.value2 } as unknown as AttributeValue;
    return {
      index: gsi,
      sortKey: sortKey,
      between: { value1, value2 }
    };
  }
  const filterOperator: keyof QueryParameterFilter<T> = Object.keys(
    filter
  )[0] as keyof QueryParameterFilter<T>;
  //eslint-disable-next-line security/detect-object-injection
  if (filterOperator && filter[filterOperator]) {
    //eslint-disable-next-line security/detect-object-injection
    const propertyType = getFilterPropertyByType(filter[filterOperator]);
    //eslint-disable-next-line security/detect-object-injection
    const value = { [propertyType]: filter[filterOperator] } as unknown as AttributeValue;
    return {
      index: gsi,
      sortKey: sortKey,
      [filterOperator]: { ...value }
    };
  }
}

/************************************************************
 * Creates a sort object into a QueryParam object to be consumed by dynamoDB
 * @param sort - type of sorting
 * @param sortKey - field name in dynamoDB
 * @param gsi - gsi to use for sort
 *
 * @returns QueryParams object
 ************************************************************/
export function parseQueryParamSort(
  sort: 'asc' | 'desc' | undefined,
  sortKey: string,
  gsi: string
): QueryParams | undefined {
  if (!sort) {
    return undefined;
  }
  const forward: boolean = sort !== 'desc';
  return {
    index: gsi,
    sortKey: sortKey,
    forward
  };
}

/************************************************************
 * Get Dynamo field type property based on a T type
 * @param value - value with type T
 *
 * @returns dynamo field type property name
 ************************************************************/
function getFilterPropertyByType<T>(value: T): keyof AttributeValue {
  switch (typeof value) {
    case 'string':
      return 'S';
    case 'number':
      return 'N';
    default:
      return 'S';
  }
}
