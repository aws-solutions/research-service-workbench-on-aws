import { AwsService } from '@aws/workbench-core-base';
import { AccessPoint } from '@aws-sdk/client-s3-control';
import _ from 'lodash';
import Setup from '../setup';

export class DatasetHelper {
  private _awsSdk: AwsService;
  public constructor() {
    const setup = Setup.getSetup();
    this._awsSdk = setup.getMainAwsClient();
  }

  public async listAccessPoints(bucket: string, accountId: string): Promise<Array<AccessPoint>> {
    const response = await this._awsSdk.clients.s3Control.listAccessPoints({
      AccountId: accountId,
      Bucket: bucket
    })!;
    return response.AccessPointList!;
  }

  public async deleteS3Resources(bucket: string, dir: string): Promise<void> {
    const listedObjects = await this._awsSdk.clients.s3.listObjectsV2({ Bucket: bucket, Prefix: dir })!;
    if (!listedObjects.Contents || listedObjects.Contents!.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteParams: { Bucket: string; ExpectedBucketOwner: string; Delete: { Objects: any } } = {
      Bucket: bucket,
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID!,
      Delete: { Objects: [] }
    };
    listedObjects.Contents!.forEach((key) => {
      deleteParams.Delete.Objects.push({ Key: key.Key });
    });

    await this._awsSdk.clients.s3.deleteObjects(deleteParams);
    if (listedObjects.IsTruncated) await this.deleteS3Resources(bucket, dir);
  }

  public async getS3ObjectNames(bucket: string, dir: string): Promise<string[]> {
    const listedObjects = await this._awsSdk.clients.s3.listObjectsV2({ Bucket: bucket, Prefix: dir });

    return listedObjects.Contents?.map((object) => object.Key!) ?? [];
  }

  public async deleteDdbRecords(dataSetId: string): Promise<void> {
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

    const endpoints = data.Items!;
    // Tests are not expected to create more than a couple of endpoints per DS max, so no support needed for pagintated query results
    await Promise.all(
      _.map(endpoints, async (endpoint) => {
        await this._awsSdk.helpers.ddb.delete({ pk: endpoint.pk, sk: endpoint.sk }).execute();
      })
    );
  }
}
