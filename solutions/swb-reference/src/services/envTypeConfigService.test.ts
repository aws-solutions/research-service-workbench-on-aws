/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ConflictError } from '@aws/swb-app';
import { MetadataService } from '@aws/workbench-core-base';
import { EnvironmentTypeConfigService } from '@aws/workbench-core-environments';
import { EnvTypeConfigService } from './envTypeConfigService';

describe('envTypeConfigService', () => {
  let mockEnvironmentTypeConfigService: EnvironmentTypeConfigService;
  let mockMetadataService: MetadataService;
  let envTypeConfigPlugin: EnvTypeConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnvironmentTypeConfigService = {} as EnvironmentTypeConfigService;
    mockMetadataService = {} as MetadataService;
    envTypeConfigPlugin = new EnvTypeConfigService(mockEnvironmentTypeConfigService, mockMetadataService);
  });

  describe('delete', () => {
    const deleteRequest = { envTypeId: 'envTypeId', envTypeConfigId: 'envTypeConfigId' };
    test('throws Conflict Error when associations exist', async () => {
      mockMetadataService.listDependentMetadata = jest.fn().mockReturnValueOnce({
        data: [{ pk: 'mockResult', sk: 'mockResult', id: 'mockResult' }],
        paginationToken: undefined
      });
      // OPERATE n CHECK
      await expect(() => envTypeConfigPlugin.deleteEnvTypeConfig(deleteRequest)).rejects.toThrow(
        ConflictError
      );
    });
    test('deletes when no associations exist', async () => {
      mockMetadataService.listDependentMetadata = jest.fn().mockReturnValueOnce({ data: [] });
      mockEnvironmentTypeConfigService.softDeleteEnvironmentTypeConfig = jest.fn().mockReturnValueOnce({});
      // OPERATE n CHECK
      await expect(() => envTypeConfigPlugin.deleteEnvTypeConfig(deleteRequest)).resolves;
    });
  });
});
