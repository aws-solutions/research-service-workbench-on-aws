/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export function buildDynamoDBPkSk(id: string, type: string): { pk: string; sk: string } {
  const key = buildDynamoDbKey(id, type);
  return { pk: key, sk: key };
}

export function buildDynamoDbKey(id: string, type: string): string {
  return `${type}#${id}`;
}

export function buildConcatenatedSk(keys: string[]): string {
  return keys.join('');
}

export function removeDynamoDbKeys(entry: { [key: string]: never }): { [key: string]: never } {
  delete entry.pk;
  delete entry.sk;
  delete entry.dependency;

  return entry;
}

export const MAX_GET_ITEMS_SIZE: number = 100;
