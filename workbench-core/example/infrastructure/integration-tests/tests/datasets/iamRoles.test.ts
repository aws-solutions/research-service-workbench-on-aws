/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AddDatasetPermissionsToRoleRequest,
  CreateRegisterExternalBucketRoleRequest
} from '@aws/workbench-core-datasets';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('datasets IAM tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('createRegisterExternalBucketRole tests', () => {
    let validRequest: CreateRegisterExternalBucketRoleRequest;

    beforeEach(() => {
      validRequest = {
        roleName: 'roleName',
        awsAccountId: 'awsAccountId',
        awsBucketRegion: 'awsBucketRegion',
        s3BucketArn: 's3BucketArn',
        assumingAwsAccountId: 'assumingAwsAccountId',
        externalId: 'externalId'
      };
    });

    it('returns an IAM role', async () => {
      const expected =
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"roleName","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"assumingAwsAccountId"},"Action":["sts:AssumeRole"],"Condition":{"StringEquals":{"sts:ExternalId":"externalId"}}}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:awsBucketRegion:awsAccountId:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["s3BucketArn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["s3BucketArn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}}]}}]}}';
      const response = await adminSession.resources.datasets.createRole(validRequest);
      expect(JSON.parse(response.data.iamRoleString)).toStrictEqual(JSON.parse(expected));
    });

    it('returns an IAM role with KMS permissions when the KMS key ARN is provided', async () => {
      const expected =
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"roleName","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"assumingAwsAccountId"},"Action":["sts:AssumeRole"],"Condition":{"StringEquals":{"sts:ExternalId":"externalId"}}}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:awsBucketRegion:awsAccountId:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["s3BucketArn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["s3BucketArn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}},{"Sid":"UpdateKmsKeyPolicy","Effect":"Allow","Action":["kms:GetKeyPolicy","kms:PutKeyPolicy"],"Resource":["kmsKeyArn"]}]}}]}}';
      const response = await adminSession.resources.datasets.createRole({
        ...validRequest,
        kmsKeyArn: 'kmsKeyArn'
      });
      expect(JSON.parse(response.data.iamRoleString)).toStrictEqual(JSON.parse(expected));
    });

    it('throws when the roleName parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.roleName;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the roleName parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.roleName = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the awsAccountId parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.awsAccountId;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the awsAccountId parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.awsAccountId = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the awsBucketRegion parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.awsBucketRegion;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the awsBucketRegion parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.awsBucketRegion = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the s3BucketArn parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.s3BucketArn;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the s3BucketArn parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.s3BucketArn = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the assumingAwsAccountId parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.assumingAwsAccountId;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the assumingAwsAccountId parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.assumingAwsAccountId = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the externalId parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.externalId;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the externalId parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.externalId = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the kmsKeyArn parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.kmsKeyArn = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });

  describe('addDatasetPermissionsToRole', () => {
    let validRequest: AddDatasetPermissionsToRoleRequest;

    beforeEach(() => {
      validRequest = {
        roleString:
          '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"roleName","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"assumingAwsAccountId"},"Action":["sts:AssumeRole"],"Condition":{"StringEquals":{"sts:ExternalId":"externalId"}}}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:awsBucketRegion:awsAccountId:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["s3BucketArn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["s3BucketArn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}}]}}]}}',
        accessPointArn: 'accessPointArn',
        datasetPrefix: 'datasetPrefix'
      };
    });

    it('returns an updated IAM role with permissions to access the given dataset', async () => {
      const expected =
        '{"Type":"AWS::IAM::Role","Properties":{"RoleName":"roleName","AssumeRolePolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"assumingAwsAccountId"},"Action":["sts:AssumeRole"],"Condition":{"StringEquals":{"sts:ExternalId":"externalId"}}}]},"Description":"A role that allows the datasets package to perform basic actions","Policies":[{"PolicyName":"dataset-base-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Sid":"AccessPointCreationDeletion","Effect":"Allow","Action":["s3:CreateAccessPoint","s3:DeleteAccessPoint","s3:GetAccessPointPolicy","s3:PutAccessPointPolicy"],"Resource":["arn:aws:s3:awsBucketRegion:awsAccountId:accesspoint/*"]},{"Sid":"CreateRemoveAccessPointDelegation","Effect":"Allow","Action":["s3:GetBucketPolicy","s3:PutBucketPolicy"],"Resource":["s3BucketArn"]},{"Sid":"ListTopLevelFolders","Effect":"Allow","Action":"s3:ListBucket","Resource":["s3BucketArn"],"Condition":{"StringEquals":{"s3:prefix":[""],"s3:delimiter":["/"]}}}]}},{"PolicyName":"datasetPrefix-permissions","PolicyDocument":{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:ListBucket","Resource":["accessPointArn"],"Condition":{"StringLike":{"s3:prefix":"datasetPrefix/*"}}},{"Effect":"Allow","Action":["s3:GetObject","s3:PutObject"],"Resource":"accessPointArn/object/datasetPrefix/*"}]}}]}}';
      const response = await adminSession.resources.datasets.updateRole(validRequest);
      expect(JSON.parse(response.data.iamRoleString)).toStrictEqual(JSON.parse(expected));
    });

    it('throws when the roleString doesnt represent a valid IAM role', async () => {
      await expect(
        adminSession.resources.datasets.updateRole({ ...validRequest, roleString: 'invalid' })
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the roleString parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.roleString;
      await expect(
        adminSession.resources.datasets.updateRole(
          invalidRequest as unknown as AddDatasetPermissionsToRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the roleString parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.roleString = 123;
      await expect(
        adminSession.resources.datasets.updateRole(
          invalidRequest as unknown as AddDatasetPermissionsToRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the accessPointArn parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.accessPointArn;
      await expect(
        adminSession.resources.datasets.updateRole(
          invalidRequest as unknown as AddDatasetPermissionsToRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the accessPointArn parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.accessPointArn = 123;
      await expect(
        adminSession.resources.datasets.updateRole(
          invalidRequest as unknown as AddDatasetPermissionsToRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the datasetPrefix parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.datasetPrefix;
      await expect(
        adminSession.resources.datasets.updateRole(
          invalidRequest as unknown as AddDatasetPermissionsToRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the datasetPrefix parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.datasetPrefix = 123;
      await expect(
        adminSession.resources.datasets.updateRole(
          invalidRequest as unknown as AddDatasetPermissionsToRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });
});
