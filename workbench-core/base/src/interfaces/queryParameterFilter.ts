/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface QueryParameterFilter<T> {
  eq?: T;
  lt?: T;
  lte?: T;
  gt?: T;
  gte?: T;
  between?: { value1: T; value2: T };
  begins?: T;
}
