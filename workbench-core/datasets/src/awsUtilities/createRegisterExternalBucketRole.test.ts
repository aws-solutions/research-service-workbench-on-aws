/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { createRegisterExternalBucketRole } from './createRegisterExternalBucketRole';

const baseRequest = {
  roleName: 'Sample-Role-Name',
  awsAccountId: 'Sample-AWS_Account-Id',
  awsBucketRegion: 'Sample-AWS-Bucket-Region',
  s3BucketArn: 'Sample-S3-Bucket-Arn',
  assumingAwsAccountId: 'Sample-Assuming-AWS-Account-Id',
  externalId: 'Sample-External-Id'
} as const;

describe('generateBaseDatasetsRole', () => {
  it('generates a string version of a CFN IAM role', () => {
    const roleString = JSON.stringify({
      Type: 'AWS::IAM::Role',
      Properties: {
        RoleName: baseRequest.roleName,
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: baseRequest.assumingAwsAccountId },
              Action: ['sts:AssumeRole'],
              Condition: {
                StringEquals: {
                  'sts:ExternalId': baseRequest.externalId
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
                  Resource: [
                    `arn:aws:s3:${baseRequest.awsBucketRegion}:${baseRequest.awsAccountId}:accesspoint/*`
                  ]
                },
                {
                  Sid: 'CreateRemoveAccessPointDelegation',
                  Effect: 'Allow',
                  Action: ['s3:GetBucketPolicy', 's3:PutBucketPolicy'],
                  Resource: [baseRequest.s3BucketArn]
                },
                {
                  Sid: 'ListTopLevelFolders',
                  Effect: 'Allow',
                  Action: 's3:ListBucket',
                  Resource: [baseRequest.s3BucketArn],
                  Condition: { StringEquals: { 's3:prefix': [''], 's3:delimiter': ['/'] } }
                }
              ]
            }
          }
        ]
      }
    });
    const response = createRegisterExternalBucketRole(baseRequest);

    expect(response).toStrictEqual({
      iamRoleString: roleString
    });
  });

  it('includes KMS key policy when a KMS key Arn is included', () => {
    const request = {
      ...baseRequest,
      kmsKeyArn: 'Sample-KMS-Key-Arn'
    };
    const roleString = JSON.stringify({
      Type: 'AWS::IAM::Role',
      Properties: {
        RoleName: baseRequest.roleName,
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: baseRequest.assumingAwsAccountId },
              Action: ['sts:AssumeRole'],
              Condition: {
                StringEquals: {
                  'sts:ExternalId': baseRequest.externalId
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
                  Resource: [
                    `arn:aws:s3:${baseRequest.awsBucketRegion}:${baseRequest.awsAccountId}:accesspoint/*`
                  ]
                },
                {
                  Sid: 'CreateRemoveAccessPointDelegation',
                  Effect: 'Allow',
                  Action: ['s3:GetBucketPolicy', 's3:PutBucketPolicy'],
                  Resource: [baseRequest.s3BucketArn]
                },
                {
                  Sid: 'ListTopLevelFolders',
                  Effect: 'Allow',
                  Action: 's3:ListBucket',
                  Resource: [baseRequest.s3BucketArn],
                  Condition: { StringEquals: { 's3:prefix': [''], 's3:delimiter': ['/'] } }
                },
                {
                  Sid: 'UpdateKmsKeyPolicy',
                  Effect: 'Allow',
                  Action: ['kms:GetKeyPolicy', 'kms:PutKeyPolicy'],
                  Resource: [request.kmsKeyArn]
                }
              ]
            }
          }
        ]
      }
    });

    const response = createRegisterExternalBucketRole(request);

    expect(response).toStrictEqual({
      iamRoleString: roleString
    });
  });
});
