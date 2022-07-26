/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// https://www.damirscorner.com/blog/posts/20200619-StringLiteralTypeGuardInTypescript.html
// This file is structured this way so we can verify whether a user input is of type `SortAttribute`
export const SORT_ATTRIBUTE: string[] = ['status', 'name', 'createdAt', 'project', 'owner', 'type'];

// Convert SORT_ATTRIBUTE array to string literals
// More info here: https://stackoverflow.com/a/59541566
export type SortAttribute = typeof SORT_ATTRIBUTE[number];

// This allows us to verify that user input is an attribute we can sort on
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSortAttribute(attribute: any): attribute is SortAttribute {
  if (typeof attribute !== 'string') {
    return false;
  }
  return SORT_ATTRIBUTE.includes(attribute as SortAttribute);
}
