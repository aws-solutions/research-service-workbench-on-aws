/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// TODO: Any code that use this file should be refactored to use `queryStringParamFilter` or `queryNumberParamFilter`.
// This file has not been deleted because some feature branches uses this file. Keeping this file for now will help alleviate merge conflicts when the feature branch is merged into develop

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
