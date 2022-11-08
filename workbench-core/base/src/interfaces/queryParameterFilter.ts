/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/************
 *
 * Only one operator can be defined by property, if multiple operators are defined, dynamo service will throw an exception.
 *
 ************/
export interface QueryParameterFilter<T> {
  eq?: T;
  lt?: T;
  lte?: T;
  gt?: T;
  gte?: T;
  between?: { value1: T; value2: T };
  begins?: T;
}
