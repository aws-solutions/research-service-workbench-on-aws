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
/* eslint-disable security/detect-object-injection */
const lodash_1 = __importDefault(require('lodash'));
/**
 * All settings used during the tests are stored here. The main advantage of having to use get/set methods
 * when accessing settings values is so that we can print an informative message when keys are missing.
 */
class Settings {
  constructor(yamlObject) {
    this._content = lodash_1.default.cloneDeep(yamlObject);
  }
  get entries() {
    return lodash_1.default.cloneDeep(this._content);
  }
  set(key, value) {
    // TODO: Prevent updating main CFN output values
    this._content[key] = value;
  }
  get(key) {
    const value = this._content[key];
    if (lodash_1.default.isEmpty(value) && !lodash_1.default.isBoolean(value))
      throw new Error(`The "${key}" setting value is required but it is either empty or not a boolean`);
    return value;
  }
  optional(key, defaultValue) {
    const value = this._content[key];
    if (
      lodash_1.default.isNil(value) ||
      (lodash_1.default.isString(value) && lodash_1.default.isEmpty(value))
    )
      return defaultValue;
    return value;
  }
}
exports.default = Settings;
module.exports = Settings;
//# sourceMappingURL=settings.js.map
