import { AwsService } from '@amzn/workbench-core-base';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import {
  CreateAccessPointCommand,
  CreateAccessPointCommandInput,
  CreateAccessPointCommandOutput,
  S3ControlClient,
  S3ControlClientConfig
} from '@aws-sdk/client-s3-control';
import { Credentials } from '@aws-sdk/types';
import { DataSetsStoragePlugin } from '.';

/**
 * An implementation of the {@link DataSetStoragePlugin} to support DataSets stored in an S3 Bucket.
 */
export class S3DataSetStoragePlugin implements DataSetsStoragePlugin {
  private _aws: AwsService;
  private _kmsKeyArn: string;
  private _s3control?: S3ControlClient;
  private _credentials: Credentials;
  /**
   *
   * @param s3Options - options needed to create and maintain the S3 bucket associated with this provider.
   */
  public constructor(s3Options: { region: string; credentials: Credentials; kmsKeyArn: string }) {
    this._aws = new AwsService({ region: s3Options.region, credentials: s3Options.credentials });
    this._kmsKeyArn = s3Options.kmsKeyArn;
    this._credentials = s3Options.credentials;
  }

  /**
   * Create a new DataSet storage location. For S3, this is a prefix within a bucket.
   * @param name - the name of the S3 bucket where the storage should reside.
   * @param path - the prefix to create for the dataset.
   *
   * @returns an S3 URL for the new storage location.
   */
  public async createStorage(name: string, path: string): Promise<string> {
    const objectKey: string = path.endsWith('/') ? path : `${path}/`;
    const params: PutObjectCommandInput = {
      Bucket: name,
      ContentLength: 0,
      Key: objectKey,
      ServerSideEncryption: this._kmsKeyArn
    };

    await this._aws.clients.s3.putObject(params);

    return `s3://${name}/${objectKey}`;
  }

  public async addExternalEndpoint(
    name: string,
    externalEndpointName: string,
    externalRoleName: string
  ): Promise<string> {
    if (!this._s3control) {
      const config: S3ControlClientConfig = {
        credentials: this._credentials
      };
      this._s3control = new S3ControlClient(config);
    }

    //const accessPointConfig: CreateAccessPointCommandInput = {

    //}
    //const accessPointCommand: CreateAccessPointCommand = new CreateAccessPointCommand()

    return 'done!';
  }

  public async updateExternalEndpoint(
    dataSetName: string,
    externalEndpointName: string,
    externalRoleName: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public async getExternalEndpoint(dataSetName: string, externalEndpointName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public async createPresignedUploadUrl(
    dataSetName: string,
    timeToLiveMilliseconds: number
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public async createPresignedMultiPartUploadUrls(
    dataSetName: string,
    numberOfParts: number,
    timeToLiveMilliseconds: number
  ): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  private async createAccessPoint(name: string, externalEndpointName: string): Promise<void> {}

  private async configureBucketPolicy(name: string, accessPointArn: string): Promise<void> {}

  private async configureAccessPointPolicy(
    name: string,
    dataSetPrefix: string,
    accessPointArn: string,
    externalRoleArn: string
  ): Promise<void> {}
}
