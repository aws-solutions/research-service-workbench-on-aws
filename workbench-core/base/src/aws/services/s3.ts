import {
  ListObjectsCommand,
  ListObjectsCommandInput,
  ListObjectsCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
  S3ClientConfig
} from '@aws-sdk/client-s3';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html

export default class S3 {
  private _client: S3Client;
  public constructor(config: S3ClientConfig) {
    this._client = new S3Client(config);
  }

  public putObject(params: PutObjectCommandInput): Promise<PutObjectCommandOutput> {
    return this._client.send(new PutObjectCommand(params));
  }

  public listObject(params: ListObjectsCommandInput): Promise<ListObjectsCommandOutput> {
    return this._client.send(new ListObjectsCommand(params));
  }
}
