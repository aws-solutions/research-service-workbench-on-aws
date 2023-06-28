/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import _ from 'lodash';

export default class HttpError extends Error {
  public statusCode: number;
  public body: unknown;
  public statusDescription: string;
  public isBase64Encoded?: boolean;
  public headers?: { 'Content-Type': string };

  public constructor(statusCode: number, body: unknown, description?: string) {
    super(`HttpError with statusCode ${statusCode}`);
    this.statusCode = statusCode;
    this.body = body;
    this.statusDescription = description || '';
  }

  public isEqual(error: Error): boolean {
    const isErrorEqual =
      error instanceof HttpError && error.statusCode === this.statusCode && _.isEqual(error.body, this.body);
    if (!isErrorEqual) {
      console.error(
        `Errors do not match. Expected error is ${JSON.stringify(this)}. Actual error is ${JSON.stringify(
          error
        )}`
      );
    }
    return isErrorEqual;
  }
}
