/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// https://www.damirscorner.com/blog/posts/20200619-StringLiteralTypeGuardInTypescript.html
// This file is structured this way so we can verify whether a user input is of type `ProjectStatus`
export const PROJECT_STATUS: string[] = ['AVAILABLE', 'SUSPENDED', 'DELETED'];

// Convert PROJECT_STATUS array to string literals
// More info here: https://stackoverflow.com/a/59541566
export type ProjectStatus = typeof PROJECT_STATUS[number];

// This allows us to verify that user input is an ProjectStatus
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isProjectStatus(status: any): status is ProjectStatus {
  if (typeof status !== 'string') {
    return false;
  }
  return PROJECT_STATUS.includes(status as ProjectStatus);
}
