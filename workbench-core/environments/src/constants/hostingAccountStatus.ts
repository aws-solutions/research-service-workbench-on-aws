/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// https://www.damirscorner.com/blog/posts/20200619-StringLiteralTypeGuardInTypescript.html
// This file is structured this way so we can verify whether a user input is of type `EnvironmentStatus`
export const HOSTING_ACCOUNT_STATUS: string[] = [
  'CURRENT',
  'NEEDS_UPDATE',
  'NEEDS_ONBOARD',
  'PENDING',
  'ERRORED',
  'UNKNOWN'
];

// Convert HOSTING_ACCOUNT_STATUS array to string literals
// More info here: https://stackoverflow.com/a/59541566
export type HostingAccountStatus = typeof HOSTING_ACCOUNT_STATUS[number];

// This allows us to verify that user input is an EnvironmentStatus
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isHostingAccountStatus(status: any): status is HostingAccountStatus {
  if (typeof status !== 'string') {
    return false;
  }
  return HOSTING_ACCOUNT_STATUS.includes(status as HostingAccountStatus);
}
