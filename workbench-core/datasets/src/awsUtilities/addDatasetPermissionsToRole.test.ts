/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { addDatasetPermissionsToRole } from './addDatasetPermissionsToRole';

describe('addDatasetPermissionsToRole', () => {
  it('appends a policy to affect one dataset to an existing IAM role string', () => {
    const request = {
      roleString:
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"Sample-Role-Name","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"Sample-Assuming-AWS-Account-Id"},"Action":["sts:AssumeRole"]}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:Sample-AWS-Bucket-Region:Sample-AWS_Account-Id:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["Sample-S3-Bucket-Arn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["Sample-S3-Bucket-Arn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}},{"Sid":"TODO","Effect":"Allow","Action":["kms:GetKeyPolicy","kms:PutKeyPolicy"],"Resource":["Sample-KMS-Key-Arn"]}]}}]}}',
      accessPointArn: 'Sample-Access-Point-Arn',
      datasetPrefix: 'Sample-Dataset-Prefix'
    };

    const response = addDatasetPermissionsToRole(request);

    expect(response).toStrictEqual({
      iamRoleString:
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"Sample-Role-Name","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"Sample-Assuming-AWS-Account-Id"},"Action":["sts:AssumeRole"]}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:Sample-AWS-Bucket-Region:Sample-AWS_Account-Id:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["Sample-S3-Bucket-Arn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["Sample-S3-Bucket-Arn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}},{"Sid":"TODO","Effect":"Allow","Action":["kms:GetKeyPolicy","kms:PutKeyPolicy"],"Resource":["Sample-KMS-Key-Arn"]}]}},{"PolicyName":"Sample-Dataset-Prefix-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:ListBucket","Resource":["Sample-Access-Point-Arn"],"Condition":{"StringLike":{"s3:prefix":"Sample-Dataset-Prefix/*"}}},{"Effect":"Allow","Action":["s3:GetObject","s3:PutObject"],"Resource":"Sample-Access-Point-Arn/object/Sample-Dataset-Prefix/*"}]}}]}}'
    });
  });

  it('throws an InvalidRoleStringError when the roleString is malformed', () => {
    const request = {
      roleString:
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"Sample-Role-Name","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"Sample-Assuming-AWS-Account-Id"},"Action":["sts:AssumeRole"]}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:Sample-AWS-Bucket-Region:Sample-AWS_Account-Id:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["Sample-S3-Bucket-Arn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["Sample-S3-Bucket-Arn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}},{"Sid":"TODO","Effect":"Allow","Action":["kms:GetKeyPolicy","kms:PutKeyPolicy"],"Resource":["Sample-KMS-Key-Arn"]}]}}]}}',
      accessPointArn: 'Sample-Access-Point-Arn',
      datasetPrefix: 'Sample-Dataset-Prefix'
    };

    expect(() => {
      addDatasetPermissionsToRole({ ...request, roleString: '' });
    }).toThrow(Error); // TODO replace with custom error
  });
});
