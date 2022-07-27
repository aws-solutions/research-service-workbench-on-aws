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
