import { AwsService } from '@amzn/workbench-core-base';
import { PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import {
  GetBucketPolicyCommandInput,
  GetBucketPolicyCommandOutput,
  PutBucketPolicyCommandInput,
  PutObjectCommandInput
} from '@aws-sdk/client-s3';
import {
  CreateAccessPointCommandInput,
  CreateAccessPointCommandOutput,
  GetAccessPointPolicyCommandInput,
  GetAccessPointPolicyCommandOutput,
  PutAccessPointPolicyCommandInput
} from '@aws-sdk/client-s3-control';
import IamHelper from './iamHelper';
import { DataSetsStoragePlugin } from '.';

/**
 * An implementation of the {@link DataSetStoragePlugin} to support DataSets stored in an S3 Bucket.
 */
export class S3DataSetStoragePlugin implements DataSetsStoragePlugin {
  private _aws: AwsService;
  private _kmsKeyArn: string;

  /**
   *
   * @param aws - {@link AwsService}
   * @param kmsKeyArn - KMS Key ARN.
   */
  public constructor(aws: AwsService, kmsKeyArn: string) {
    this._aws = aws;
    this._kmsKeyArn = kmsKeyArn;
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

  /**
   * Add an external endpoint (accesspoint) to the S3 Bucket and grant access
   * to the dataset prefix for a given external role.
   * @param name - the name of the S3 bucket where the storage resides.
   * @param path - the S3 bucket prefix which identifies the root of the DataSet.
   * @param externalEndpointName - the name of the access pont to create.
   * @param externalRoleName - the role which will be given access to the files under the prefix.
   * @returns a string representing the URI to the dataset root prefix.
   */
  public async addExternalEndpoint(
    name: string,
    path: string,
    externalEndpointName: string,
    externalRoleName: string
  ): Promise<string> {
    const accessPointArn: string = await this._createAccessPoint(name, externalEndpointName);
    await this._configureBucketPolicy(name, accessPointArn);
    await this._configureAccessPointPolicy(
      name,
      path,
      externalEndpointName,
      accessPointArn,
      externalRoleName
    );
    return `s3://${accessPointArn}/${path}/`;
  }

  public async addRoleToExternalEndpoint(
    name: string,
    externalEndpointName: string,
    externalRoleName: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public async removeRoleFromExternalEndpoint(
    name: string,
    externalEndpointName: string,
    externalRoleArn: string
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // public async getExternalEndpoint(dataSetName: string, externalEndpointName: string): Promise<string> {
  //   throw new Error('Method not implemented.');
  // }

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

  private async _createAccessPoint(name: string, externalEndpointName: string): Promise<string> {
    const accessPointConfig: CreateAccessPointCommandInput = {
      Name: externalEndpointName,
      Bucket: name
    };
    const response: CreateAccessPointCommandOutput = await this._aws.clients.s3Control.createAccessPoint(
      accessPointConfig
    );
    return `${response.AccessPointArn}`;
  }

  private async _configureBucketPolicy(name: string, accessPointArn: string): Promise<void> {
    const getBucketPolicyConfig: GetBucketPolicyCommandInput = {
      Bucket: name
    };
    const s3BucketArn: string = `arn:aws:s3:::${name}`;
    const accountId: string = this._awsAccountIdFromArn(accessPointArn);

    const delegationStatement = PolicyStatement.fromJson(
      JSON.parse(`
     {
      "Effect": "Allow",
      "Principal": {
        "AWS":"*"
      },
      "Action": "*",
      "Resource": ["${s3BucketArn}", "${s3BucketArn}/*"],
      "Condition": {
        "StringEquals": {
          "s3:DataAccessPointAccount": "${accountId}"
          }
        }
      }`)
    );

    const bucketPolicyResponse: GetBucketPolicyCommandOutput = await this._aws.clients.s3.getBucketPolicy(
      getBucketPolicyConfig
    );
    let bucketPolicy: PolicyDocument;
    if (bucketPolicyResponse.Policy) {
      bucketPolicy = PolicyDocument.fromJson(JSON.parse(bucketPolicyResponse.Policy));
    } else {
      bucketPolicy = new PolicyDocument();
    }

    if (IamHelper.policyDocumentContainsStatement(bucketPolicy, delegationStatement)) return;

    bucketPolicy.addStatements(delegationStatement);

    const putPolicyParams: PutBucketPolicyCommandInput = {
      Bucket: name,
      Policy: JSON.stringify(bucketPolicy.toJSON())
    };

    await this._aws.clients.s3.putBucketPolicy(putPolicyParams);
  }

  private async _configureAccessPointPolicy(
    name: string,
    dataSetPrefix: string,
    accessPointName: string,
    accessPointArn: string,
    externalRoleArn: string
  ): Promise<void> {
    const listBucketPolicyStatement = PolicyStatement.fromJson(
      JSON.parse(`
    {
      "Effect": "Allow",
      "Principal": {
        "AWS":"${externalRoleArn}"
      },
      "Action": "s3:ListBucket",
      "Resource": "${accessPointArn}"
    }
    `)
    );

    const getPutBucketPolicyStatement = PolicyStatement.fromJson(
      JSON.parse(`
    {
      "Effect": "Allow",
      "Principal": {
        "AWS":"${externalRoleArn}"
      },
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "${accessPointArn}/object/${dataSetPrefix}/*"
    }
    `)
    );

    const accountId: string = this._awsAccountIdFromArn(accessPointArn);
    const getPolicyParams: GetAccessPointPolicyCommandInput = {
      AccountId: accountId,
      Name: accessPointName
    };

    const apPolicyResponse: GetAccessPointPolicyCommandOutput =
      await this._aws.clients.s3Control.getAccessPointPolicy(getPolicyParams);
    let apPolicy: PolicyDocument;
    if (apPolicyResponse.Policy) {
      apPolicy = PolicyDocument.fromJson(JSON.parse(apPolicyResponse.Policy));
    } else {
      apPolicy = new PolicyDocument();
    }

    let isDirty: boolean = false;

    if (!IamHelper.policyDocumentContainsStatement(apPolicy, listBucketPolicyStatement)) {
      isDirty = true;
      apPolicy.addStatements(listBucketPolicyStatement);
    }

    if (IamHelper.policyDocumentContainsStatement(apPolicy, getPutBucketPolicyStatement)) {
      if (!isDirty) return;
    } else {
      apPolicy.addStatements(getPutBucketPolicyStatement);
    }

    const putPolicyParams: PutAccessPointPolicyCommandInput = {
      AccountId: accountId,
      Name: accessPointName,
      Policy: JSON.stringify(apPolicy.toJSON())
    };

    await this._aws.clients.s3Control.putAccessPointPolicy(putPolicyParams);
  }

  private _awsAccountIdFromArn(arn: string): string {
    const arnParts = arn.split(':');
    if (arnParts.length < 6) {
      throw new Error("Expected an arn with at least six ':' separated values.");
    }

    if (!arnParts[4] || arnParts[4] === '') {
      throw new Error('Expected an arn with an AWS AccountID however AWS AccountID field is empty.');
    }

    return arnParts[4];
  }
}
