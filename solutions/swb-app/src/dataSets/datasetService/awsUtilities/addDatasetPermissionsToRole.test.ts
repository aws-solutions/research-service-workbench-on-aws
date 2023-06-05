/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { isInvalidIamRoleError } from '../errors/invalidIamRoleError';
import { addDatasetPermissionsToRole } from './addDatasetPermissionsToRole';

describe('addDatasetPermissionsToRole', () => {
  it('appends a policy to affect one dataset to an existing IAM role string', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sampleRole: any = {
      Type: 'AWS::IAM::Role',
      Properties: {
        RoleName: 'Sample-Role-Name',
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                AWS: 'Sample-Assuming-AWS-Account-Id'
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
                  Resource: ['arn:aws:s3:Sample-AWS-Bucket-Region:Sample-AWS_Account-Id:accesspoint/*']
                },
                {
                  Sid: 'CreateRemoveAccessPointDelegation',
                  Effect: 'Allow',
                  Action: ['s3:GetBucketPolicy', 's3:PutBucketPolicy'],
                  Resource: ['Sample-S3-Bucket-Arn']
                },
                {
                  Sid: 'ListTopLevelFolders',
                  Effect: 'Allow',
                  Action: 's3:ListBucket',
                  Resource: ['Sample-S3-Bucket-Arn'],
                  Condition: {
                    StringEquals: {
                      's3:prefix': [''],
                      's3:delimiter': ['/']
                    }
                  }
                },
                {
                  Sid: 'UpdateKmsKeyPolicy',
                  Effect: 'Allow',
                  Action: ['kms:GetKeyPolicy', 'kms:PutKeyPolicy'],
                  Resource: ['Sample-KMS-Key-Arn']
                }
              ]
            }
          }
        ]
      }
    };
    const request = {
      roleString: JSON.stringify(sampleRole),
      accessPointArn: 'Sample-Access-Point-Arn',
      datasetPrefix: 'Sample-Dataset-Prefix'
    };
    const responseRole = { ...sampleRole };
    responseRole.Properties.Policies.push({
      PolicyName: `${request.datasetPrefix}-permissions`,
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:ListBucket',
            Resource: [request.accessPointArn],
            Condition: {
              StringLike: {
                's3:prefix': `${request.datasetPrefix}/*`
              }
            }
          },
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject'],
            Resource: `${request.accessPointArn}/object/${request.datasetPrefix}/*`
          }
        ]
      }
    });

    const response = addDatasetPermissionsToRole(request);

    expect(response).toStrictEqual({
      iamRoleString: JSON.stringify(responseRole)
    });
  });

  it('throws an InvalidIamRoleError when the roleString is malformed', () => {
    const request = {
      roleString: '',
      accessPointArn: 'Sample-Access-Point-Arn',
      datasetPrefix: 'Sample-Dataset-Prefix'
    };

    try {
      addDatasetPermissionsToRole(request);
    } catch (e) {
      expect(isInvalidIamRoleError(e)).toBe(true);
    }
    expect.hasAssertions();
  });
});
