/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// https://www.damirscorner.com/blog/posts/20200619-StringLiteralTypeGuardInTypescript.html
// This file is structured this way so we can verify whether a user input is of type `EnvironmentStatus`
export const ENVIRONMENT_TYPE_STATUS: string[] = ['APPROVED', 'NOT_APPROVED'];

// Convert ENVIRONMENT_TYPE_STATUS array to string literals
// More info here: https://stackoverflow.com/a/59541566
export type EnvironmentTypeStatus = typeof ENVIRONMENT_TYPE_STATUS[number];

// This allows us to verify that user input is an EnvironmentTypeStatus
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEnvironmentTypeStatus(status: any): status is EnvironmentTypeStatus {
  if (typeof status !== 'string') {
    return false;
  }
  return ENVIRONMENT_TYPE_STATUS.includes(status as EnvironmentTypeStatus);
}
