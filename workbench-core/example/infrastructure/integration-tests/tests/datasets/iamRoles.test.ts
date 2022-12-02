/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateRegisterExternalBucketRoleRequest } from '@aws/workbench-core-datasets';
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
        roleName: 'TODO',
        awsAccountId: 'TODO',
        awsBucketRegion: 'TODO',
        s3BucketArn: 'TODO',
        assumingAwsAccountId: 'TODO',
        externalId: 'TODO'
      };
    });

    it('returns an IAM role', async () => {});

    it('returns an IAM role with KMS permissions when the KMS key ARN is provided', async () => {});

    it('throws when the XX parameter in the request body is missing', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      delete invalidRequest.roleName;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the XX parameter in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { ...validRequest };
      invalidRequest.roleName = 123;
      await expect(
        adminSession.resources.datasets.createRole(
          invalidRequest as unknown as CreateRegisterExternalBucketRoleRequest
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });

  describe('addDatasetPermissionsToRole', () => {
    it('returns an updated IAM role with permissions to access the given dataset', async () => {});

    it('throws when the XX parameter in the request body is missing', async () => {});

    it('throws when the XX parameter in the request body is not a string', async () => {});
  });
});
