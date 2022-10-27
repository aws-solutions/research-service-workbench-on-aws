'use strict';
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getResources = void 0;
const datasets_1 = __importDefault(require('./resources/datasets/datasets'));
function getResources(clientSession) {
  return {
    datasets: new datasets_1.default(clientSession)
  };
}
exports.getResources = getResources;
//# sourceMappingURL=resources.js.map
