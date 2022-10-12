/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { generateBaseDatasetsRole } from './generateBaseDatasetsRole';

const baseRequest = {
  roleName: 'Sample-Role-Name',
  awsAccountId: 'Sample-AWS_Account-Id',
  awsBucketRegion: 'Sample-AWS-Bucket-Region',
  s3BucketArn: 'Sample-S3-Bucket-Arn',
  assumingAwsAccountId: 'Sample-Assuming-AWS-Account-Id'
} as const;

describe('generateBaseDatasetsRole', () => {
  it('generates a string version of a CFN IAM role', () => {
    const response = generateBaseDatasetsRole(baseRequest);

    expect(response).toStrictEqual({
      iamRoleString:
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"Sample-Role-Name","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"Sample-Assuming-AWS-Account-Id"},"Action":["sts:AssumeRole"]}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:Sample-AWS-Bucket-Region:Sample-AWS_Account-Id:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["Sample-S3-Bucket-Arn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["Sample-S3-Bucket-Arn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}}]}}]}}'
    });
  });

  it('includes KMS key policy when a KMS key Arn is included', () => {
    const request = {
      ...baseRequest,
      kmsKeyArn: 'Sample-KMS-Key-Arn'
    };

    const response = generateBaseDatasetsRole(request);

    expect(response).toStrictEqual({
      iamRoleString:
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"Sample-Role-Name","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"Sample-Assuming-AWS-Account-Id"},"Action":["sts:AssumeRole"]}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:Sample-AWS-Bucket-Region:Sample-AWS_Account-Id:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["Sample-S3-Bucket-Arn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["Sample-S3-Bucket-Arn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}},{"Sid":"TODO","Effect":"Allow","Action":["kms:GetKeyPolicy","kms:PutKeyPolicy"],"Resource":["Sample-KMS-Key-Arn"]}]}}]}}'
    });
  });
});
