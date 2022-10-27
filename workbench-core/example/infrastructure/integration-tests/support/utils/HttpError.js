'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const lodash_1 = __importDefault(require('lodash'));
class HttpError extends Error {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(statusCode, body) {
    super(`HttpError with statusCode ${statusCode}`);
    this.statusCode = statusCode;
    this.body = body;
  }
  isEqual(error) {
    const isErrorEqual =
      error instanceof HttpError &&
      error.statusCode === this.statusCode &&
      lodash_1.default.isEqual(error.body, this.body);
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
exports.default = HttpError;
//# sourceMappingURL=HttpError.js.map
