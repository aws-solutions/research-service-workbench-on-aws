/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// https://www.damirscorner.com/blog/posts/20200619-StringLiteralTypeGuardInTypescript.html
// This file is structured this way so we can verify whether a user input is of type `EnvironmentStatus`
export const ENVIRONMENT_STATUS: string[] = [
  'PENDING',
  'COMPLETED',
  'STARTING',
  'STOPPING',
  'STOPPED',
  'TERMINATING',
  'TERMINATED',
  'FAILED',
  'TERMINATING_FAILED',
  'STARTING_FAILED',
  'STOPPING_FAILED'
];

// Convert ENVIRONMENT_STATUS array to string literals
// More info here: https://stackoverflow.com/a/59541566
export type EnvironmentStatus = typeof ENVIRONMENT_STATUS[number];

// This allows us to verify that user input is an EnvironmentStatus
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEnvironmentStatus(status: any): status is EnvironmentStatus {
  if (typeof status !== 'string') {
    return false;
  }
  return ENVIRONMENT_STATUS.includes(status as EnvironmentStatus);
}
