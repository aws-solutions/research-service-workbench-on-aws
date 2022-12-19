/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { StorageLocation } from '@aws/workbench-core-datasets';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('datasets list integration test', () => {
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

  describe('ListDataSets', () => {
    it('should return DataSets entries', async () => {
      const response = await adminSession.resources.datasets.get();
      expect(response.data).toBeDefined();
    });
  });

  describe('ListStorageLocations', () => {
    it('should return StorageLocation entries', async () => {
      let response = await adminSession.resources.datasets.create({}, true);

      const location: StorageLocation = {
        name: response.data.storageName,
        type: response.data.storageType,
        region: response.data.region,
        awsAccountId: response.data.awsAccountId
      };
      response = await adminSession.resources.datasets.storageLocations();

      expect(response.data).toContainEqual(location);
    });
  });
});
