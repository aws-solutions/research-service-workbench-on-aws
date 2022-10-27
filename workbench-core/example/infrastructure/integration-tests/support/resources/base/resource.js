'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const lodash_1 = __importDefault(require('lodash'));
class Resource {
  constructor(clientSession, type, id, parentApi) {
    this._api = '';
    this._axiosInstance = clientSession.getAxiosInstance();
    this._settings = clientSession.getSettings();
    this._setup = clientSession.getSetup();
    this._type = type;
    this._id = id;
    this._parentApi = parentApi;
    // Most child resources have standard api patterns: /api/<parent resource type>/{id}
    // But we can only assume this if both the 'id' and 'parentApi' are provided. In addition,
    // the extending class can simply choose to construct their own specialized api path
    // and do so in their own constructor functions.
    if (!lodash_1.default.isEmpty(id) && !lodash_1.default.isEmpty(parentApi)) {
      this._api = `${parentApi}/${id}`;
    }
  }
  async get() {
    return this._axiosInstance.get(this._api);
  }
  async update(body) {
    return this._axiosInstance.put(this._api, body);
  }
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete() {
    await this._axiosInstance.delete(this._api);
  }
  // This method should be overridden by the class extending `resource`
  /**
   * Delete any resource that was created
   */
  async cleanup() {}
}
exports.default = Resource;
//# sourceMappingURL=resource.js.map
