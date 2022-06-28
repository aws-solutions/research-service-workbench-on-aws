// We wrap the call to axios so that we can capture the boom code and payload attributes passed from the
// server
// eslint-disable-next-line
import _ from 'lodash';

// eslint-disable-next-line
async function doCall(fn: Function): Promise<any> {
  try {
    const response = await fn();
    return response.data;
  } catch (error) {
    console.log('Error is', error);
  }
}

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

export { doCall, sleep };
