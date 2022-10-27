'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.DatasetHelper = void 0;
const lodash_1 = __importDefault(require('lodash'));
const setup_1 = __importDefault(require('../setup'));
class DatasetHelper {
  constructor() {
    const setup = new setup_1.default();
    this._awsSdk = setup.getMainAwsClient();
  }
  async listAccessPoints(bucket, accountId) {
    const response = await this._awsSdk.clients.s3Control.listAccessPoints({
      AccountId: accountId,
      Bucket: bucket
    });
    return response.AccessPointList;
  }
  async deleteS3Resources(bucket, dir) {
    const listedObjects = await this._awsSdk.clients.s3.listObjectsV2({ Bucket: bucket, Prefix: dir });
    if (listedObjects.Contents.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: [] }
    };
    listedObjects.Contents.forEach((key) => {
      deleteParams.Delete.Objects.push({ Key: key.Key });
    });
    await this._awsSdk.clients.s3.deleteObjects(deleteParams);
    if (listedObjects.IsTruncated) await this.deleteS3Resources(bucket, dir);
  }
  async deleteDdbRecords(dataSetId) {
    await this._awsSdk.helpers.ddb
      .delete({ pk: `DATASET#${dataSetId}`, sk: `DATASET#${dataSetId}` })
      .execute();
    const data = await this._awsSdk.helpers.ddb
      .query({
        key: {
          name: 'pk',
          value: `DATASET#${dataSetId}`
        }
      })
      .execute();
    if (data.Count === 0) return;
    const endpoints = data.Items;
    // Tests are not expected to create more than a couple of endpoints per DS max, so no support needed for pagintated query results
    await Promise.all(
      lodash_1.default.map(endpoints, async (endpoint) => {
        await this._awsSdk.helpers.ddb.delete({ pk: endpoint.pk, sk: endpoint.sk }).execute();
      })
    );
  }
}
exports.DatasetHelper = DatasetHelper;
//# sourceMappingURL=datasetHelper.js.map
