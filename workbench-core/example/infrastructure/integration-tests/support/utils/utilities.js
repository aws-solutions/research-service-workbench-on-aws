'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getFakeEnvId = exports.poll = exports.checkHttpError = exports.sleep = void 0;
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const workbench_core_base_1 = require('@aws/workbench-core-base');
const uuid_1 = require('uuid');
const constants_1 = require('./constants');
const HttpError_1 = __importDefault(require('./HttpError'));
/**
 * Returns a promise that will be resolved in the requested time, ms.
 * Example: await sleep(200);
 * https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep/39914235#39914235
 *
 * @param ms - wait time in milliseconds
 *
 * @returns a promise, that will be resolved in the requested time
 */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function checkHttpError(actualError, expectedError) {
  expect(actualError instanceof HttpError_1.default).toBeTruthy();
  expect(expectedError.isEqual(actualError)).toBeTruthy();
}
exports.checkHttpError = checkHttpError;
function getFakeEnvId() {
  return `${workbench_core_base_1.resourceTypeToKey.environment.toLowerCase()}-${(0, uuid_1.v4)()}`;
}
exports.getFakeEnvId = getFakeEnvId;
async function poll(conditionData, stopCondition, maxWaitTimeInSeconds, pollingIntervalInSeconds) {
  const startTimeInMs = Date.now();
  const timeLimitInSeconds =
    maxWaitTimeInSeconds !== null && maxWaitTimeInSeconds !== void 0
      ? maxWaitTimeInSeconds
      : constants_1.DEFAULT_POLLING_MAX_WAITING_SECONDS;
  const intervalSeconds =
    pollingIntervalInSeconds !== null && pollingIntervalInSeconds !== void 0
      ? pollingIntervalInSeconds
      : constants_1.DEFAULT_POLLING_INTERVAL_SECONDS;
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
    console.log(`Polling failed.". 
      Waited ${totalTimeWaitedInSeconds} seconds for resource to reach valid state so it could finish polling; encountered error: ${e}`);
  }
}
exports.poll = poll;
//# sourceMappingURL=utilities.js.map
