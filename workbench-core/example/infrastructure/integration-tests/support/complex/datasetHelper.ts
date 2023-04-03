import { AccessPoint } from '@aws-sdk/client-s3-control';
import { AwsService, buildDynamoDbKey, buildDynamoDBPkSk, JSONValue } from '@aws/workbench-core-base';
import {
  dataSetPrefix,
  endpointPrefix,
  storageLocationPrefix
} from '@aws/workbench-core-example-app/lib/configs/constants';
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
    // delete dataset entry
    const deletedDataSet = await this._awsSdk.helpers.ddb.deleteItem({
      key: buildDynamoDBPkSk(dataSetId, dataSetPrefix),
      params: { return: 'ALL_OLD' }
    });

    // delete storage location entry
    await this._awsSdk.helpers.ddb.deleteItem({
      key: {
        pk: dataSetPrefix,
        sk: buildDynamoDbKey(deletedDataSet.storageName as string, storageLocationPrefix)
      }
    });

    // delete endpoint entries
    const data = await this._awsSdk.helpers.ddb
      .query({
        key: {
          name: 'pk',
          value: buildDynamoDbKey(dataSetId, dataSetPrefix)
        }
      })
      .execute();
    if (data.Count === 0) return;

    const endpoints = data.Items!;
    // Tests are not expected to create more than a couple of endpoints per DS max, so no support needed for pagintated query results
    await Promise.all(
      endpoints.map(async (endpoint) => {
        await this._awsSdk.helpers.ddb.delete({ pk: endpoint.pk, sk: endpoint.sk }).execute();
      })
    );
  }

  public async getddbRecords(dataSetId: string, endpointId?: string): Promise<Record<string, JSONValue>> {
    return this._awsSdk.helpers.ddb.getItem({
      key: {
        pk: buildDynamoDbKey(dataSetId, dataSetPrefix),
        sk: buildDynamoDbKey(endpointId ?? dataSetId, endpointId ? endpointPrefix : dataSetPrefix)
      }
    });
  }
}
