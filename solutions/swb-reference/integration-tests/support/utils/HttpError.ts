/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import _ from 'lodash';

export default class HttpError extends Error {
  public statusCode: number;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public body: any;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(statusCode: number, body: any) {
    super(`HttpError with statusCode ${statusCode}`);
    this.statusCode = statusCode;
    this.body = body;
  }

  public isEqual(error: Error): boolean {
    const isErrorEqual =
      error instanceof HttpError && error.statusCode === this.statusCode && _.isEqual(error.body, this.body);
    if (!isErrorEqual) {
      console.log(
        `Errors do not match. Expected error is ${JSON.stringify(this)}. Actual error is ${JSON.stringify(
          error
        )}`
      );
    }
    return isErrorEqual;
  }
}
