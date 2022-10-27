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
declare function sleep(ms: number): Promise<void>;
declare function checkHttpError(actualError: Error, expectedError: HttpError): void;
declare function getFakeEnvId(): string;
declare function poll<T>(
  conditionData: () => Promise<T>,
  stopCondition: (resource: T) => boolean,
  maxWaitTimeInSeconds?: number,
  pollingIntervalInSeconds?: number
): Promise<void>;
export { sleep, checkHttpError, poll, getFakeEnvId };
//# sourceMappingURL=utilities.d.ts.map
