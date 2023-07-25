import { AwsService, buildDynamoDbKey, buildDynamoDBPkSk, JSONValue } from '@aws/workbench-core-base';
import {
  dataSetPrefix,
  endpointPrefix,
  storageLocationPrefix
} from '@aws/workbench-core-example-app/lib/configs/constants';
import { AccessPoint } from '@aws-sdk/client-s3-control';

export class DatasetHelper {
  public static async listAccessPoints(
    awsService: AwsService,
    bucket: string,
    accountId: string
  ): Promise<Array<AccessPoint>> {
    const response = await awsService.clients.s3Control.listAccessPoints({
      AccountId: accountId,
      Bucket: bucket
    })!;
    return response.AccessPointList!;
  }

  public static async listDatasetFileNames(
    awsService: AwsService,
    bucket: string,
    dir: string
  ): Promise<string[]> {
    const response = await awsService.clients.s3.listObjectsV2({ Bucket: bucket, Prefix: dir });

    return response.Contents?.map((file) => file.Key ?? '') ?? [];
  }

  public static async deleteS3AccessPoint(
    awsService: AwsService,
    name: string,
    bucketAccount: string
  ): Promise<void> {
    await awsService.clients.s3Control.deleteAccessPoint({
      Name: name,
      AccountId: bucketAccount
    });
  }

  public static async deleteS3Resources(awsService: AwsService, bucket: string, dir: string): Promise<void> {
    const listedObjects = await awsService.clients.s3.listObjectsV2({ Bucket: bucket, Prefix: dir })!;
    if (!listedObjects.Contents?.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteParams: { Bucket: string; Delete: { Objects: any } } = {
      Bucket: bucket,
      Delete: { Objects: [] }
    };
    listedObjects.Contents!.forEach((key) => {
      deleteParams.Delete.Objects.push({ Key: key.Key });
    });

    await awsService.clients.s3.deleteObjects(deleteParams);
    if (listedObjects.IsTruncated) await DatasetHelper.deleteS3Resources(awsService, bucket, dir);
  }

  public static async deleteDdbRecords(awsService: AwsService, dataSetId: string): Promise<void> {
    // delete dataset entry
    const deletedDataSet = await awsService.helpers.ddb.deleteItem({
      key: buildDynamoDBPkSk(dataSetId, dataSetPrefix),
      params: { return: 'ALL_OLD' }
    });

    // delete storage location entry
    await awsService.helpers.ddb.deleteItem({
      key: {
        pk: dataSetPrefix,
        sk: buildDynamoDbKey(deletedDataSet.storageName as string, storageLocationPrefix)
      }
    });

    // delete endpoint entries
    const data = await awsService.helpers.ddb
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
        await awsService.helpers.ddb.delete({ pk: endpoint.pk, sk: endpoint.sk }).execute();
      })
    );
  }

  public static async getddbRecords(
    awsService: AwsService,
    dataSetId: string,
    endpointId?: string
  ): Promise<Record<string, JSONValue>> {
    return awsService.helpers.ddb.getItem({
      key: {
        pk: buildDynamoDbKey(dataSetId, dataSetPrefix),
        sk: buildDynamoDbKey(endpointId ?? dataSetId, endpointId ? endpointPrefix : dataSetPrefix)
      }
    });
  }
}
