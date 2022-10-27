'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
class RandomTextGenerator {
  constructor(runId) {
    this._runId = runId;
  }
  getFakeText(text) {
    return `${this._runId}-${text}-${this._getRandomNumberAsString()}`;
  }
  _getRandomNumberAsString() {
    const num = Math.round(Math.random() * 1000) + 1;
    return num.toString();
  }
}
exports.default = RandomTextGenerator;
//# sourceMappingURL=randomTextGenerator.js.map
