/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface CreateRegisterExternalBucketRoleRequest {
  /**
   * The name of the IAM role
   */
  roleName: string;

  /**
   * The AWS Account ID the role will be created in
   */
  awsAccountId: string;

  /**
   * The AWS region of the S3 bucket the role will modify
   */
  awsBucketRegion: string;

  /**
   * The ARN of the S3 bucket the role will modify
   */
  s3BucketArn: string;

  /**
   * The AWS Account ID of the account that will have permission to assume the role
   */
  assumingAwsAccountId: string;

  /**
   * An ID the assuming AWS account must provide to be able to assume the role
   */
  externalId: string;

  /**
   * (optional) The ARN of the KMS key the role will modify
   */
  kmsKeyArn?: string;
}

export interface CreateRegisterExternalBucketRoleResponse {
  /**
   * The created JSON.stringified IAM role
   */
  iamRoleString: string;
}

/**
 * Create an IAM role with permissions to register an external bucket
 * @param request - {@link CreateRegisterExternalBucketRoleRequest}
 * @returns - {@link CreateRegisterExternalBucketRoleResponse}
 */
export function createRegisterExternalBucketRole(
  request: CreateRegisterExternalBucketRoleRequest
): CreateRegisterExternalBucketRoleResponse {
  const {
    roleName,
    awsAccountId,
    awsBucketRegion,
    s3BucketArn,
    assumingAwsAccountId,
    externalId,
    kmsKeyArn
  } = request;

  const iamRole = {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: roleName,
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: assumingAwsAccountId
            },
            Action: ['sts:AssumeRole'],
            Condition: {
              StringEquals: {
                'sts:ExternalId': externalId
              }
            }
          }
        ]
      },
      Description: 'A role that allows the datasets package to perform basic actions',
      Policies: [
        {
          PolicyName: 'dataset-base-permissions',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'AccessPointCreationDeletion',
                Effect: 'Allow',
                Action: [
                  's3:CreateAccessPoint',
                  's3:DeleteAccessPoint',
                  's3:GetAccessPointPolicy',
                  's3:PutAccessPointPolicy'
                ],
                Resource: [`arn:aws:s3:${awsBucketRegion}:${awsAccountId}:accesspoint/*`]
              },
              {
                Sid: 'CreateRemoveAccessPointDelegation',
                Effect: 'Allow',
                Action: ['s3:GetBucketPolicy', 's3:PutBucketPolicy'],
                Resource: [s3BucketArn]
              },
              {
                Sid: 'ListTopLevelFolders',
                Effect: 'Allow',
                Action: 's3:ListBucket',
                Resource: [s3BucketArn],
                Condition: {
                  StringEquals: {
                    's3:prefix': [''],
                    's3:delimiter': ['/']
                  }
                }
              }
            ]
          }
        }
      ]
    }
  };

  if (kmsKeyArn) {
    iamRole.Properties.Policies[0].PolicyDocument.Statement.push({
      Sid: 'UpdateKmsKeyPolicy',
      Effect: 'Allow',
      Action: ['kms:GetKeyPolicy', 'kms:PutKeyPolicy'],
      Resource: [kmsKeyArn]
    });
  }

  return { iamRoleString: JSON.stringify(iamRole) };
}
