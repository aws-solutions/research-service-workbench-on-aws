import { AccessPoint } from '@aws-sdk/client-s3-control';
import { AwsService } from '@aws/workbench-core-base';
import { dataSetPrefix } from '@aws/workbench-core-example-app/lib/configs/constants';
import _ from 'lodash';
import Setup from '../setup';

export class DatasetHelper {
  private _awsSdk: AwsService;
  public constructor() {
    const setup = new Setup();
    this._awsSdk = setup.getMainAwsClient('ExampleDataSetDDBTableName');
  }

  public async listAccessPoints(bucket: string, accountId: string): Promise<Array<AccessPoint>> {
    const response = await this._awsSdk.clients.s3Control.listAccessPoints({
      AccountId: accountId,
      Bucket: bucket
    })!;
    return response.AccessPointList!;
  }

  public async listDatasetFileNames(bucket: string, dir: string): Promise<string[]> {
    const response = await this._awsSdk.clients.s3.listObjectsV2({ Bucket: bucket, Prefix: dir });

    return response.Contents?.map((file) => file.Key ?? '') ?? [];
  }

  public async deleteS3AccessPoint(name: string, bucketAccount: string): Promise<void> {
    await this._awsSdk.clients.s3Control.deleteAccessPoint({
      Name: name,
      AccountId: bucketAccount
    });
  }

  public async deleteS3Resources(bucket: string, dir: string): Promise<void> {
    const listedObjects = await this._awsSdk.clients.s3.listObjectsV2({ Bucket: bucket, Prefix: dir })!;
    if (!listedObjects.Contents?.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteParams: { Bucket: string; Delete: { Objects: any } } = {
      Bucket: bucket,
      Delete: { Objects: [] }
    };
    listedObjects.Contents!.forEach((key) => {
      deleteParams.Delete.Objects.push({ Key: key.Key });
    });

    await this._awsSdk.clients.s3.deleteObjects(deleteParams);
    if (listedObjects.IsTruncated) await this.deleteS3Resources(bucket, dir);
  }

  public async deleteDdbRecords(dataSetId: string): Promise<void> {
    await this._awsSdk.helpers.ddb
      .delete({ pk: `${dataSetPrefix}#${dataSetId}`, sk: `${dataSetPrefix}#${dataSetId}` })
      .execute();
    const data = await this._awsSdk.helpers.ddb
      .query({
        key: {
          name: 'pk',
          value: `${dataSetPrefix}#${dataSetId}`
        }
      })
      .execute();
    if (data.Count === 0) return;

    const endpoints = data.Items!;
    // Tests are not expected to create more than a couple of endpoints per DS max, so no support needed for pagintated query results
    await Promise.all(
      _.map(endpoints, async (endpoint) => {
        await this._awsSdk.helpers.ddb.delete({ pk: endpoint.pk, sk: endpoint.sk }).execute();
      })
    );
  }
}
