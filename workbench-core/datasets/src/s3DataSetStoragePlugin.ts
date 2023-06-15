/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@aws/workbench-core-base';
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
  DeleteAccessPointCommandInput,
  GetAccessPointPolicyCommandInput,
  GetAccessPointPolicyCommandOutput,
  PutAccessPointPolicyCommandInput
} from '@aws-sdk/client-s3-control';
import { PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IamHelper, InsertStatementResult } from './awsUtilities/iamHelper';
import { DataSetsStoragePlugin } from './dataSetsStoragePlugin';
import { EndpointExistsError } from './errors/endpointExistsError';
import { InvalidArnError } from './errors/invalidArnError';
import { InvalidEndpointError } from './errors/invalidEndpointError';
import {
  AddStorageExternalEndpointRequest,
  AddStorageExternalEndpointResponse
} from './models/addStorageExternalEndpoint';
import { DataSet } from './models/dataSet';
import { DataSetsAccessLevel } from './models/dataSetsAccessLevel';

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
      Key: objectKey,
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    };

    await this._aws.clients.s3.putObject(params);

    return `s3://${name}/${objectKey}`;
  }

  public async importStorage(name: string, path: string): Promise<string> {
    const objectKey: string = path.endsWith('/') ? path : `${path}/`;
    return `s3://${name}/${objectKey}`;
  }

  /**
   * Deletes an external endpoint (accesspoint) to the S3 Bucket
   * @param externalEndpointName - the name of the access pont to create.
   * @param ownerAccountId - the owning AWS account for the bucket.
   */
  public async removeExternalEndpoint(externalEndpointName: string, ownerAccountId: string): Promise<void> {
    await this._deleteAccessPoint(externalEndpointName, ownerAccountId);
  }

  /**
   * Add an external endpoint (accesspoint) to the S3 Bucket and grant access
   * to the dataset prefix for a given external role if provided.
   * @param name - the name of the S3 bucket where the storage resides.
   * @param path - the S3 bucket prefix which identifies the root of the DataSet.
   * @param externalEndpointName - the name of the access pont to create.
   * @param ownerAccountId - the owning AWS account for the bucket.
   * @param accessLevel - the {@link DataSetsAccessLevel} to give to the access point.
   * @param externalRoleName - an optional role which will be given access to the files under the prefix.
   * @param kmsKeyArn - an optional arn to a KMS key (recommended) which handles encryption on the files in the bucket.
   * @param vpcId - an optional ID of the VPC interacting with the endpoint.
   * @returns the S3 URL and the alias which can be used to access the endpoint.
   * @throws {@link EndpointExistsError} - the endpoint already exists
   * @throws {@link InvalidArnError} - the externalRoleName is not in a valid format
   */
  public async addExternalEndpoint(
    request: AddStorageExternalEndpointRequest
  ): Promise<AddStorageExternalEndpointResponse> {
    const {
      name,
      externalEndpointName,
      ownerAccountId,
      vpcId,
      externalRoleName,
      path,
      accessLevel,
      kmsKeyArn
    } = request;

    const response: { endPointArn: string; endPointAlias: string } = await this._createAccessPoint(
      name,
      externalEndpointName,
      ownerAccountId,
      vpcId
    );
    await this._configureBucketPolicy(name, response.endPointArn);

    if (externalRoleName) {
      await this._configureAccessPointPolicy({
        dataSetPrefix: path,
        accessPointName: externalEndpointName,
        accessPointArn: response.endPointArn,
        externalRoleArn: externalRoleName,
        accessLevel
      });
      if (kmsKeyArn) await this._configureKmsKey(kmsKeyArn, externalRoleName);
    }
    return {
      data: {
        connections: {
          endPointUrl: `s3://${response.endPointArn}`,
          endPointAlias: response.endPointAlias
        }
      }
    };
  }

  public async addRoleToExternalEndpoint(
    name: string,
    path: string,
    externalEndpointName: string,
    externalRoleName: string,
    endPointUrl: string,
    kmsKeyArn?: string
  ): Promise<void> {
    // TODO: either throw error if not formatted correctly or support all S3 URL types https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html
    const endPointArn: string = endPointUrl.replace('s3://', '');
    await this._configureAccessPointPolicy({
      dataSetPrefix: path,
      accessPointName: externalEndpointName,
      accessPointArn: endPointArn,
      externalRoleArn: externalRoleName
    });

    if (kmsKeyArn) await this._configureKmsKey(kmsKeyArn, externalRoleName);
  }

  public async removeRoleFromExternalEndpoint(
    name: string,
    externalEndpointName: string,
    externalRoleArn: string
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async createPresignedUploadUrl(
    dataset: DataSet,
    fileName: string,
    timeToLiveSeconds: number
  ): Promise<string> {
    return await this._aws.helpers.s3.createPresignedUploadUrl(
      dataset.storageName,
      `${dataset.name}/${fileName}`,
      timeToLiveSeconds
    );
  }

  public async createPresignedMultiPartUploadUrls(
    dataSetName: string,
    numberOfParts: number,
    timeToLiveSeconds: number
  ): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  private async _deleteAccessPoint(externalEndpointName: string, bucketAccount: string): Promise<void> {
    const accessPointConfig: DeleteAccessPointCommandInput = {
      Name: externalEndpointName,
      AccountId: bucketAccount
    };
    await this._aws.clients.s3Control.deleteAccessPoint(accessPointConfig);
  }

  private async _createAccessPoint(
    name: string,
    externalEndpointName: string,
    bucketAccount: string,
    vpcId?: string
  ): Promise<{ endPointArn: string; endPointAlias: string }> {
    const accessPointConfig: CreateAccessPointCommandInput = {
      Name: externalEndpointName,
      Bucket: name,
      AccountId: bucketAccount
    };
    if (vpcId) {
      accessPointConfig.VpcConfiguration = { VpcId: vpcId };
    }
    try {
      const { AccessPointArn, Alias } = await this._aws.clients.s3Control.createAccessPoint(
        accessPointConfig
      );

      if (!AccessPointArn) {
        throw new InvalidEndpointError(`Endpoint "${externalEndpointName}" did not generate an endPointArn.`);
      }
      if (!Alias) {
        throw new InvalidEndpointError(
          `Endpoint "${externalEndpointName}" did not generate an endPointAlias.`
        );
      }

      return {
        endPointArn: AccessPointArn,
        endPointAlias: Alias
      };
    } catch (error) {
      if (error.name === 'AccessPointAlreadyOwnedByYou') {
        throw new EndpointExistsError(error.message);
      }
      throw error;
    }
  }

  private async _configureBucketPolicy(name: string, accessPointArn: string): Promise<void> {
    const s3BucketArn: string = `arn:aws:s3:::${name}`;
    const accountId: string = this._awsAccountIdFromArn(accessPointArn);

    const delegationStatement = PolicyStatement.fromJson(
      JSON.parse(`
     {
      "Effect": "Allow",
      "Principal": {
        "AWS":"*"
      },
      "Action": "s3:*",
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
      const getBucketPolicyConfig: GetBucketPolicyCommandInput = {
        Bucket: name,
        ExpectedBucketOwner: process.env.MAIN_ACCT_ID
      };
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
      Policy: JSON.stringify(bucketPolicy.toJSON()),
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    };

    await this._aws.clients.s3.putBucketPolicy(putPolicyParams);
  }

  private async _configureAccessPointPolicy(config: {
    dataSetPrefix: string;
    accessPointName: string;
    accessPointArn: string;
    externalRoleArn: string;
    accessLevel?: DataSetsAccessLevel;
  }): Promise<void> {
    const { externalRoleArn, accessPointArn, dataSetPrefix, accessLevel, accessPointName } = config;

    const listBucketPolicyStatement = PolicyStatement.fromJson(
      JSON.parse(`
    {
      "Effect": "Allow",
      "Principal": {
        "AWS":"${externalRoleArn}"
      },
      "Action": "s3:ListBucket",
      "Resource": "${accessPointArn}",
      "Condition": {
        "StringLike": {
          "s3:prefix": "${dataSetPrefix}/*"
        }
      }
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
      "Action": "s3:GetObject",
      "Resource": "${accessPointArn}/object/${dataSetPrefix}/*"
    }
    `)
    );

    if (accessLevel !== 'read-only') {
      getPutBucketPolicyStatement.addActions('s3:PutObject');
    }

    const accountId: string = this._awsAccountIdFromArn(accessPointArn);
    const getPolicyParams: GetAccessPointPolicyCommandInput = {
      AccountId: accountId,
      Name: accessPointName
    };

    let apPolicy: PolicyDocument = new PolicyDocument();
    // s3Control GetAccessPointPolicy throws NoSuchAccessPointPolicy error when policy doesn't exist
    try {
      const apPolicyResponse: GetAccessPointPolicyCommandOutput =
        await this._aws.clients.s3Control.getAccessPointPolicy(getPolicyParams);
      if (apPolicyResponse.Policy) apPolicy = PolicyDocument.fromJson(JSON.parse(apPolicyResponse.Policy));
    } catch (err) {
      if (err.Code !== 'NoSuchAccessPointPolicy') throw err;
    }

    let updateResult: InsertStatementResult = IamHelper.insertStatementIntoDocument(
      listBucketPolicyStatement,
      apPolicy
    );
    const isPolicyUpdated = updateResult.documentUpdated;

    updateResult = IamHelper.insertStatementIntoDocument(
      getPutBucketPolicyStatement,
      updateResult.documentResult
    );

    if (isPolicyUpdated || updateResult.documentUpdated) {
      const putPolicyParams: PutAccessPointPolicyCommandInput = {
        AccountId: accountId,
        Name: accessPointName,
        Policy: JSON.stringify(updateResult.documentResult.toJSON())
      };
      await this._aws.clients.s3Control.putAccessPointPolicy(putPolicyParams);
    }
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
      throw new InvalidArnError("Expected an arn with at least six ':' separated values.");
    }

    if (!arnParts[4] || arnParts[4] === '') {
      throw new InvalidArnError(
        'Expected an arn with an AWS AccountID however AWS AccountID field is empty.'
      );
    }

    return arnParts[4];
  }
}
