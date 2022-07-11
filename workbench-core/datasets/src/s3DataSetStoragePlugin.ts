import { AwsService } from '@amzn/workbench-core-base';
import { PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import {
  GetKeyPolicyCommandInput,
  GetKeyPolicyCommandOutput,
  PutKeyPolicyCommandInput
} from '@aws-sdk/client-kms';
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
import { EndpointConnectionStrings } from './dataSetsStoragePlugin';
import IamHelper from './iamHelper';
import { DataSetsStoragePlugin } from '.';

/**
 * An implementation of the {@link DataSetStoragePlugin} to support DataSets stored in an S3 Bucket.
 */
export class S3DataSetStoragePlugin implements DataSetsStoragePlugin {
  private _aws: AwsService;

  /**
   *
   * @param aws - {@link AwsService}
   */
  public constructor(aws: AwsService) {
    this._aws = aws;
  }

  public getStorageType(): string {
    return 'S3';
  }

  /**
   * Create a new DataSet storage location. For S3, this is a prefix within an existing S3 bucket.
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
      Key: objectKey
    };

    await this._aws.clients.s3.putObject(params);

    return `s3://${name}/${objectKey}`;
  }

  public async importStorage(name: string, path: string): Promise<string> {
    const objectKey: string = path.endsWith('/') ? path : `${path}/`;
    return `s3://${name}/${objectKey}`;
  }

  /**
   * Add an external endpoint (accesspoint) to the S3 Bucket and grant access
   * to the dataset prefix for a given external role if provided.
   * @param name - the name of the S3 bucket where the storage resides.
   * @param path - the S3 bucket prefix which identifies the root of the DataSet.
   * @param externalEndpointName - the name of the access pont to create.
   * @param ownerAccountId - the owning AWS account for the bucket.
   * @param externalRoleName - an optional role which will be given access to the files under the prefix.
   * @param kmsKeyArn - an optional arn to a KMS key (recommended) which handles encryption on the files in the bucket.
   * @returns the S3 URL and the alias which can be used to access the endpoint.
   */
  public async addExternalEndpoint(
    name: string,
    path: string,
    externalEndpointName: string,
    ownerAccountId: string,
    externalRoleName?: string,
    kmsKeyArn?: string
  ): Promise<EndpointConnectionStrings> {
    const response: { endPointArn: string; endPointAlias: string | undefined } =
      await this._createAccessPoint(name, externalEndpointName, ownerAccountId);
    await this._configureBucketPolicy(name, response.endPointArn);

    if (externalRoleName) {
      await this._configureAccessPointPolicy(
        name,
        path,
        externalEndpointName,
        response.endPointArn,
        externalRoleName
      );
      if (kmsKeyArn) await this._configureKmsKey(kmsKeyArn, externalRoleName);
    }
    return {
      endPointUrl: `s3://${response.endPointArn}/`,
      endPointAlias: response.endPointAlias
    };
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

  private async _createAccessPoint(
    name: string,
    externalEndpointName: string,
    bucketAccount: string
  ): Promise<{ endPointArn: string; endPointAlias: string | undefined }> {
    const accessPointConfig: CreateAccessPointCommandInput = {
      Name: externalEndpointName,
      Bucket: name,
      AccountId: bucketAccount
    };
    const response: CreateAccessPointCommandOutput = await this._aws.clients.s3Control.createAccessPoint(
      accessPointConfig
    );
    return {
      endPointArn: response.AccessPointArn!,
      endPointAlias: response.Alias
    };
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

    let bucketPolicy: PolicyDocument = new PolicyDocument();
    try {
      const bucketPolicyResponse: GetBucketPolicyCommandOutput = await this._aws.clients.s3.getBucketPolicy(
        getBucketPolicyConfig
      );
      if (bucketPolicyResponse.Policy) {
        bucketPolicy = PolicyDocument.fromJson(JSON.parse(bucketPolicyResponse.Policy));
      }
    } catch (e) {
      // All errors should be thrown except "NoSuchBucketPolicy" error. For "NoSuchBucketPolicy" error we assign new bucket policy for bucket
      if (e.Code !== 'NoSuchBucketPolicy') {
        throw e;
      }
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

  private async _configureKmsKey(kmsKeyArn: string, externalRoleName: string): Promise<void> {
    const accountId = this._awsAccountIdFromArn(externalRoleName);

    // key usage statement
    const usageStatement: PolicyStatement = PolicyStatement.fromJson(
      JSON.parse(`
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${accountId}:root"
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }`)
    );

    // allow attachment statement
    const attachStatement: PolicyStatement = PolicyStatement.fromJson(
      JSON.parse(`
    {
      "Effect": "Allow",
      "Principal": {
        "AWS":"arn:aws:iam::${accountId}:root"
      },
      "Action": [
        "kms:CreateGrant",
        "kms:ListGrant",
        "kms:RevokeGrant"
      ],
      "Resource": "*",
      "Condition": {
        "Bool": {
          "kms:GrantIsForAWSResource": "true"
        }
      }
    }`)
    );

    const params: GetKeyPolicyCommandInput = {
      KeyId: kmsKeyArn,
      PolicyName: 'default'
    };
    const kmsPolicyResponse: GetKeyPolicyCommandOutput = await this._aws.clients.kms.getKeyPolicy(params);
    let kmsPolicy: PolicyDocument;
    if (kmsPolicyResponse.Policy) {
      kmsPolicy = PolicyDocument.fromJson(JSON.parse(kmsPolicyResponse.Policy));
    } else {
      kmsPolicy = new PolicyDocument();
    }

    let isDirty: boolean = false;
    if (!IamHelper.policyDocumentContainsStatement(kmsPolicy, usageStatement)) {
      isDirty = true;
      kmsPolicy.addStatements(usageStatement);
    }

    if (IamHelper.policyDocumentContainsStatement(kmsPolicy, attachStatement)) {
      if (!isDirty) return;
    } else {
      kmsPolicy.addStatements(attachStatement);
    }

    const putPolicyParams: PutKeyPolicyCommandInput = {
      KeyId: kmsKeyArn,
      PolicyName: 'default',
      Policy: JSON.stringify(kmsPolicy.toJSON())
    };

    await this._aws.clients.kms.putKeyPolicy(putPolicyParams);
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
