/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_POLLING_INTERVAL_SECONDS, DEFAULT_POLLING_MAX_WAITING_SECONDS } from './constants';
import HttpError from './HttpError';

const validAlphaNumeric: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const validSwbName: string = validAlphaNumeric + '-_.';
const validSwbDescription: string = validAlphaNumeric + '-_. ';

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
  if (!(actualError instanceof HttpError)) {
    throw new Error(`Error was not an HttpError. Actual error: ${JSON.stringify(actualError)}`);
  }
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

function generateInvalidIds(prefix: string): string[] {
  return [
    `${prefix}1-12345678-1234-1234-123f-1234567890ab`, //invalid prefix
    `${prefix}-1234567g-1234-1234-123f-1234567890ab`, //invalid out of range g in 1st uuid section
    `${prefix}-12345678f-1234-1234-123f-1234567890ab`, //invalid extra char in 1st uuid section
    `${prefix}-12345678-123g-1234-123f-1234567890ab`, //invalid out of range g in 2nd uuid section
    `${prefix}-12345678-1234f-1234-123f-1234567890ab`, //invalid extra char in 2nd uuid section
    `${prefix}-12345678-1234-123g-123f-1234567890ab`, //invalid out of range g in 3rd uuid section
    `${prefix}-12345678-1234-1234f-123f-1234567890ab`, //invalid extra char in 3rd uuid section
    `${prefix}-12345678-1234-1234-123g-1234567890ab`, //invalid out of range g in 4th uuid section
    `${prefix}-12345678-1234-1234-123ff-1234567890ab`, //invalid extra char in 4th uuid section
    `${prefix}-12345678-1234-1234-123f-1234567890ag`, //invalid out of range g in 5th uuid section
    `${prefix}-12345678-1234-1234-123f-1234567890abf` //invalid extra char in 5ht uuid section
  ];
}

function generateRandomString(length: number, validChars: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += validChars.charAt(Math.floor(Math.random() * validChars.length));
  }
  return result;
}

function generateRandomAlphaNumericString(length: number): string {
  return generateRandomString(length, validAlphaNumeric);
}

export {
  sleep,
  checkHttpError,
  poll,
  getFakeEnvId,
  generateInvalidIds,
  generateRandomString,
  generateRandomAlphaNumericString,
  validAlphaNumeric,
  validSwbName,
  validSwbDescription
};
