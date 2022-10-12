/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface GenerateBaseDatasetsRoleRequest {
  roleName: string;
  awsAccountId: string;
  awsBucketRegion: string;
  s3BucketArn: string;
  assumingAwsAccountId: string;
  kmsKeyArn?: string;
}

export interface GenerateBaseDatasetsRoleResponse {
  iamRoleString: string;
}

export function generateBaseDatasetsRole(
  request: GenerateBaseDatasetsRoleRequest
): GenerateBaseDatasetsRoleResponse {
  const { roleName, awsAccountId, awsBucketRegion, s3BucketArn, assumingAwsAccountId, kmsKeyArn } = request;

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
            Action: ['sts:AssumeRole']
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
      Sid: 'TODO',
      Effect: 'Allow',
      Action: ['kms:GetKeyPolicy', 'kms:PutKeyPolicy'],
      Resource: [kmsKeyArn]
    });
  }

  return { iamRoleString: JSON.stringify(iamRole) };
}
