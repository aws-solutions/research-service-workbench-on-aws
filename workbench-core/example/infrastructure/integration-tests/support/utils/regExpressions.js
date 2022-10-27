'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.dsUuidRegExp = exports.envUuidRegExp = void 0;
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const workbench_core_base_1 = require('@aws/workbench-core-base');
exports.envUuidRegExp = (0, workbench_core_base_1.uuidWithLowercasePrefixRegExp)(
  workbench_core_base_1.resourceTypeToKey.environment
);
exports.dsUuidRegExp = (0, workbench_core_base_1.uuidWithLowercasePrefixRegExp)(
  workbench_core_base_1.resourceTypeToKey.dataset
);
//# sourceMappingURL=regExpressions.js.map
