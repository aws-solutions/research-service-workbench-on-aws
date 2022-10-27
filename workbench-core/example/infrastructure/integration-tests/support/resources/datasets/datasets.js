'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const randomTextGenerator_1 = __importDefault(require('../../utils/randomTextGenerator'));
const collectionResource_1 = __importDefault(require('../base/collectionResource'));
const dataset_1 = __importDefault(require('./dataset'));
class Datasets extends collectionResource_1.default {
  constructor(clientSession) {
    super(clientSession, 'datasets', 'dataset');
    this._api = 'datasets';
  }
  dataset(id) {
    return new dataset_1.default(id, this._clientSession, this._api);
  }
  async import(requestBody) {
    return this._axiosInstance.post(`${this._api}/import`, requestBody);
  }
  _buildDefaults(resource) {
    var _a, _b;
    const randomTextGenerator = new randomTextGenerator_1.default(this._settings.get('runId'));
    const dataSetName = randomTextGenerator.getFakeText('test-DS');
    return {
      datasetName: (_a = resource.datasetName) !== null && _a !== void 0 ? _a : dataSetName,
      path: (_b = resource.path) !== null && _b !== void 0 ? _b : dataSetName,
      storageName: resource.storageName,
      awsAccountId: resource.awsAccountId,
      region: resource.region
    };
  }
}
exports.default = Datasets;
//# sourceMappingURL=datasets.js.map
