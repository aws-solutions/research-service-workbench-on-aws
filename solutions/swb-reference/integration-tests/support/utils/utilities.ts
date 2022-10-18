/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_POLLING_INTERVAL_SECONDS, DEFAULT_POLLING_MAX_WAITING_SECONDS } from './constants';
import HttpError from './HttpError';

/**
 * Marks all properties (including nested) as Partial.
 * https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript
 */
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * Returns a promise that will be resolved in the requested time, ms.
 * Example: await sleep(200);
 * https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep/39914235#39914235
 *
 * @param ms - wait time in milliseconds
 *
 * @returns a promise, that will be resolved in the requested time
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkHttpError(actualError: Error, expectedError: HttpError): void {
  expect(actualError instanceof HttpError).toBeTruthy();
  expect(expectedError.isEqual(actualError)).toBeTruthy();
}

function getFakeEnvId(): string {
  return `${resourceTypeToKey.environment.toLowerCase()}-${uuidv4()}`;
}

async function poll<T>(
  conditionData: () => Promise<T>,
  stopCondition: (resource: T) => boolean,
  maxWaitTimeInSeconds?: number,
  pollingIntervalInSeconds?: number
): Promise<void> {
  const startTimeInMs = Date.now();
  const timeLimitInSeconds = maxWaitTimeInSeconds ?? DEFAULT_POLLING_MAX_WAITING_SECONDS;
  const intervalSeconds = pollingIntervalInSeconds ?? DEFAULT_POLLING_INTERVAL_SECONDS;
  let totalTimeWaitedInSeconds = 0;

  let data = await conditionData();
  try {
    console.log(`Polling in progress. This will take a few minutes.`);
    while (!stopCondition(data) && totalTimeWaitedInSeconds < timeLimitInSeconds) {
      await sleep(intervalSeconds * 1000);
      data = await conditionData();
      totalTimeWaitedInSeconds = (Date.now() - startTimeInMs) / 1000;
    }
    if (totalTimeWaitedInSeconds >= timeLimitInSeconds)
      console.log(`Polling exceeded the time limit (${timeLimitInSeconds} seconds).`);
    else console.log(`Polling finished successfully.`);
  } catch (e) {
    console.log(
      `Polling failed.". 
      Waited ${totalTimeWaitedInSeconds} seconds for resource to reach valid state so it could finish polling; encountered error: ${e}`
    );
  }
}

export { sleep, checkHttpError, poll, getFakeEnvId, RecursivePartial };
