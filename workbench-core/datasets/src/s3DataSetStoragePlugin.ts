import { AwsService } from '@amzn/workbench-core-base';
import { AnyPrincipal, Effect, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import {
  GetBucketPolicyCommandInput,
  GetBucketPolicyCommandOutput,
  PutBucketPolicyCommandInput,
  PutObjectCommandInput
} from '@aws-sdk/client-s3';
import { CreateAccessPointCommandInput, CreateAccessPointCommandOutput } from '@aws-sdk/client-s3-control';
import { Credentials } from '@aws-sdk/types';
import _ from 'lodash';
import { DataSetsStoragePlugin } from '.';

/**
 * An implementation of the {@link DataSetStoragePlugin} to support DataSets stored in an S3 Bucket.
 */
export class S3DataSetStoragePlugin implements DataSetsStoragePlugin {
  private _aws: AwsService;
  private _kmsKeyArn: string;

  /**
   *
   * @param s3Options - options needed to create and maintain the S3 bucket associated with this provider.
   */
  public constructor(s3Options: { region: string; credentials: Credentials; kmsKeyArn: string }) {
    this._aws = new AwsService({ region: s3Options.region, credentials: s3Options.credentials });
    this._kmsKeyArn = s3Options.kmsKeyArn;
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
    const accessPointUri: string = await this._createAccessPoint(name, externalEndpointName);

    // apply a control delegation policy to the bucket.

    // apply bucket policy for the external URI.

    return accessPointUri;
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

  private async _createAccessPoint(name: string, externalEndpointName: string): Promise<string> {
    const accessPointConfig: CreateAccessPointCommandInput = {
      Name: externalEndpointName,
      Bucket: name
    };
    const response: CreateAccessPointCommandOutput = await this._aws.clients.s3Control.createAccessPoint(
      accessPointConfig
    );
    return `s3://${response.AccessPointArn}`;
  }

  private async _configureBucketPolicy(name: string, accessPointArn: string): Promise<void> {
    const getBucketPolicyConfig: GetBucketPolicyCommandInput = {
      Bucket: name
    };
    const s3BucketArn: string = `arn:aws:s3:::${name}`;
    const accountId: string = this._awsAccountIdFromArn(accessPointArn);
    const delegationStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ['*'], // this will be limted in the access point policy.
      resources: [s3BucketArn, `${s3BucketArn}/*`],
      conditions: {
        StringEquals: {
          's3:DataAccessPointAccount': accountId
        }
      }
    });

    const bucketPolicyResponse: GetBucketPolicyCommandOutput = await this._aws.clients.s3.getBucketPolicy(
      getBucketPolicyConfig
    );
    let bucketPolicy: PolicyDocument;
    if (bucketPolicyResponse.Policy) {
      bucketPolicy = PolicyDocument.fromJson(bucketPolicyResponse.Policy);
    } else {
      bucketPolicy = new PolicyDocument();
    }

    if (this._bucketPolicyContainsDelegationStatement(bucketPolicy, accountId)) return;

    bucketPolicy.addStatements(delegationStatement);

    const putPolicyParams: PutBucketPolicyCommandInput = {
      Bucket: name,
      Policy: bucketPolicy.toString()
    };

    await this._aws.clients.s3.putBucketPolicy(putPolicyParams);
  }

  private async _configureAccessPointPolicy(
    name: string,
    dataSetPrefix: string,
    accessPointArn: string,
    externalRoleArn: string
  ): Promise<void> {}

  private _awsAccountIdFromArn(arn: string): string {
    const arnParts = arn.split(':');
    if (arnParts.length < 6) {
      throw new Error("Expected an arn with at least six ':' sepearted values.");
    }

    if (arnParts[4] === '') {
      throw new Error('Expected an arn with an AWS AccountID however AWS AccountID field is empty.');
    }

    return arnParts[4];
  }

  private _bucketPolicyContainsDelegationStatement(policy: PolicyDocument, accountId: string): boolean {
    const policyObj = policy.toJSON();
    _.map(policyObj.Statements, (s) => {
      if (this._isBucketDelegationStatement(PolicyStatement.fromJson(s), accountId)) return true;
    });

    return false;
  }

  private _isBucketDelegationStatement(statement: PolicyStatement, accountId: string): boolean {
    // principal should be the "AWS: *"
    if (!statement.hasPrincipal) return false;
    if (!statement.principals.includes(new AnyPrincipal())) return false;
    if (statement.effect !== Effect.ALLOW) return false;
    if (statement.actions.length !== 1) return false;
    if (!statement.actions.includes('*')) return false;

    const conditions = JSON.parse(statement.conditions);
    const stringEqualsCondition = _.get(conditions, 'StringEquals');
    if (!stringEqualsCondition) return false;
    const condReg = new RegExp('^\\s*s3:DataAccessPointAccountss*:\\s*\\d{12}\\s*$');
    const matches = stringEqualsCondition.toString().match(condReg);
    if (!matches) return false;
    if (_.find(matches, (m) => m === accountId)) return true;
    return false;
  }
}
