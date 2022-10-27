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
const datasetHelper_1 = require('../../complex/datasetHelper');
const resource_1 = __importDefault(require('../base/resource'));
class Dataset extends resource_1.default {
  constructor(id, clientSession, parentApi) {
    super(clientSession, 'dataset', id, parentApi);
  }
  async share(requestBody) {
    return this._axiosInstance.post(`${this._api}/share`, requestBody);
  }
  async cleanup() {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const { data: resource } = await defAdminSession.resources.datasets.dataset(this._id).get();
    const { storageName, path } = resource;
    // Delete DDB entries, and path folder from bucket (to prevent test resources polluting a prod env)
    const datasetHelper = new datasetHelper_1.DatasetHelper();
    await datasetHelper.deleteS3Resources(storageName, path);
    await datasetHelper.deleteDdbRecords(this._id);
  }
}
exports.default = Dataset;
//# sourceMappingURL=dataset.js.map
