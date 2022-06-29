import HttpError from './HttpError';

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
export { sleep, checkHttpError };
