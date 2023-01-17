/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { marshall } from '@aws-sdk/util-dynamodb';
import * as Boom from '@hapi/boom';
import { FilterRequest } from '../interfaces/filterRequest';
import QueryParams from '../interfaces/queryParams';

import { SortRequest } from '../interfaces/sortRequest';

/************************************************************
 * Validates only one sorting or filter in list requests
 * @param filter - filter request object
 * @param sort - sorting request object
 ************************************************************/
export function validateSingleSortAndFilter(filter?: FilterRequest, sort?: SortRequest): void {
  const filterAttributesLength = filter ? Object.keys(filter).length : 0;
  const sortAttributesLength = sort ? Object.keys(sort).length : 0;
  // Check that at most one filter is defined because we not support more than one filter
  if (filterAttributesLength > 1) {
    throw Boom.badRequest('Cannot apply more than one filter.');
  }
  // Check that at most one sort attribute is defined because we not support sorting by more than one attribute
  if (sortAttributesLength > 1) {
    throw Boom.badRequest('Cannot sort by more than one attribute.');
  }
  const hasSameProperty =
    filterAttributesLength === 1 &&
    sortAttributesLength === 1 &&
    Object.keys(filter ?? {})[0] === Object.keys(sort ?? {})[0];
  if (filter && sort && !hasSameProperty) {
    throw Boom.badRequest('Cannot apply a filter and sort to different properties at the same time');
  }
}

/************************************************************
 * Parses FilterRequest into QueryParam object consumed by dynamoDB
 *
 * @param filter - filter request object
 * @param gsiPropertyNames - field names on pascal case format to retrieve gsi name
 *
 * @returns QueryParams object
 ************************************************************/
export function getFilterQueryParams(filter: FilterRequest | undefined, gsiNames: string[]): QueryParams {
  //validate filter request doesnt have more than one filter or no filters
  if (!filter || Object.keys(filter).length === 0) {
    return {};
  }
  if (Object.keys(filter).length > 1) {
    throw Boom.badRequest('Cannot filter by more than one attribute.');
  }
  //only one entry will exist due to validation above
  const { key, value } = Object.entries(filter).map(([key, value]) => {
    return { key, value };
  })[0];
  //transform { operator: value } into { operator { type: value } }
  const filterQueryParam = (
    value?.between ? { between: marshall(value.between) } : marshall(value)
  ) as QueryParams;
  //get GSI from gsi list in params
  const gsiMatches = gsiNames.filter(
    (prop) => prop.replace('getResourceBy', '').toLowerCase() === key.toLowerCase()
  );
  const gsi = gsiMatches && gsiMatches.length > 0 ? gsiMatches[0] : '';
  //only return when format is correct
  if (filterQueryParam && Object.keys(filterQueryParam).length > 0 && gsi) {
    return {
      index: gsi,
      sortKey: key,
      ...filterQueryParam
    };
  } else {
    throw Boom.badRequest('Filter contains invalid format.');
  }
}

/************************************************************
 * Creates a sort request object into a QueryParam object to be consumed by dynamoDB
 * @param sort - sort request property object
 * @param gsiPropertyNames - field names on pascal case format to retrieve gsi name
 * @returns QueryParams object
 ************************************************************/
export function getSortQueryParams(sort: SortRequest | undefined, gsiNames: string[]): QueryParams {
  if (!sort || Object.keys(sort).length === 0) {
    return {};
  }
  if (Object.keys(sort).length > 1) {
    throw Boom.badRequest('Cannot sort by more than one attribute.');
  }
  //only one entry will exist due to validation above
  const { key, value } = Object.entries(sort).map(([key, value]) => {
    return { key, value };
  })[0];

  //get GSI from gsi list in params
  const gsiMatches = gsiNames.filter(
    (prop) => prop.replace('getResourceBy', '').toLowerCase() === key.toLowerCase()
  );
  const gsi = gsiMatches && gsiMatches.length > 0 ? gsiMatches[0] : '';
  const forward = value === 'asc';
  //only return when format is correct
  if (gsiMatches && gsi) {
    return {
      index: gsi,
      sortKey: key,
      forward
    };
  } else {
    throw Boom.badRequest('Sort contains invalid format.');
  }
}
