import {
  GetBucketPolicyCommand,
  GetBucketPolicyCommandInput,
  GetBucketPolicyCommandOutput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandInput,
  ListObjectsCommandOutput,
  PutBucketPolicyCommand,
  PutBucketPolicyCommandInput,
  PutBucketPolicyCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  ListBucketsCommandInput,
  ListBucketsCommand,
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

  public async getBucketPolicy(params: GetBucketPolicyCommandInput): Promise<GetBucketPolicyCommandOutput> {
    return this._client.send(new GetBucketPolicyCommand(params));
  }

  public getObject(params: GetObjectCommandInput): Promise<GetObjectCommandOutput> {
    return this._client.send(new GetObjectCommand(params));
  }

  public putObject(params: PutObjectCommandInput): Promise<PutObjectCommandOutput> {
    return this._client.send(new PutObjectCommand(params));
  }

  public listObject(params: ListObjectsCommandInput): Promise<ListObjectsCommandOutput> {
    return this._client.send(new ListObjectsCommand(params));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public listBuckets(params: ListBucketsCommandInput): Promise<any> {
    return this._client.send(new ListBucketsCommand(params));
  }

  public async putBucketPolicy(params: PutBucketPolicyCommandInput): Promise<PutBucketPolicyCommandOutput> {
    return this._client.send(new PutBucketPolicyCommand(params));
  }
}
