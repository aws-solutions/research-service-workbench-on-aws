/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 *
 * @param promises - array of promises to run in batch
 * @param batchSize - batch size
 * @returns
 */
export async function runInBatches<T>(promises: Promise<T>[], batchSize: number): Promise<T[]> {
  const batch: Promise<T>[] = [];
  const result: T[] = [];
  for (const element of promises) {
    batch.push(element);
    if (batch.length === batchSize) {
      result.push(...(await Promise.all(batch)));
      batch.length = 0;
    }
  }

  if (batch.length) {
    result.push(...(await Promise.all(batch)));
  }

  return result;
}
