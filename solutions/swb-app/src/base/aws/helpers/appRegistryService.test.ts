/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CloudFormation } from '@aws-sdk/client-cloudformation';
import { ServiceCatalogAppRegistry } from '@aws-sdk/client-service-catalog-appregistry';
import { ServiceQuotas } from '@aws-sdk/client-service-quotas';
import AppRegistryService from './appRegistryService';

describe('appRegistryService', () => {
  let mockServiceCatalogAppRegistry: ServiceCatalogAppRegistry;
  let mockCloudFormation: CloudFormation;
  let mockServiceQuotas: ServiceQuotas;
  let appRegistryService: AppRegistryService;
  const appRegistryName = 'appRegTest';
  const stackName = 'stackTest';
  const appRegistryApplication = {
    id: 'appRegId',
    associatedResourceCount: 0
  };
  const stackDetails = {
    Stacks: [
      {
        StackId: 'stackId'
      }
    ]
  };
  const appRegistryQuota = {
    Quota: {
      Value: 1000
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockServiceCatalogAppRegistry = {} as ServiceCatalogAppRegistry;
    mockCloudFormation = {} as CloudFormation;
    mockServiceQuotas = {} as ServiceQuotas;
    appRegistryService = new AppRegistryService(
      mockServiceCatalogAppRegistry,
      mockCloudFormation,
      mockServiceQuotas
    );
  });

  describe('associateStackToAppRegistry', () => {
    beforeEach(() => {
      mockServiceCatalogAppRegistry.getApplication = jest.fn().mockReturnValue(appRegistryApplication);
      mockCloudFormation.describeStacks = jest.fn().mockReturnValueOnce(stackDetails);
      mockServiceQuotas.getServiceQuota = jest.fn().mockReturnValue(appRegistryQuota);
      mockServiceCatalogAppRegistry.associateResource = jest.fn().mockReturnValue({});
    });
    test('Do not throw when app registry application is not found', async () => {
      mockServiceCatalogAppRegistry.getApplication = jest
        .fn()
        .mockRejectedValueOnce(new Error('App Registry Not found'));
      await expect(
        appRegistryService.associateStackToAppRegistry(appRegistryName, stackName)
      ).resolves.not.toThrow();
      expect(mockServiceCatalogAppRegistry.associateResource).toHaveBeenCalledTimes(0);
    });
    test('Do not throw when stack is not found', async () => {
      mockCloudFormation.describeStacks = jest.fn().mockRejectedValueOnce(new Error('Stack Not found'));
      await expect(
        appRegistryService.associateStackToAppRegistry(appRegistryName, stackName)
      ).resolves.not.toThrow();
      expect(mockServiceCatalogAppRegistry.associateResource).toHaveBeenCalledTimes(0);
    });
    test('Do not throw when service quota is reached', async () => {
      mockServiceCatalogAppRegistry.getApplication = jest
        .fn()
        .mockReturnValue({ ...appRegistryApplication, associatedResourceCount: 1 });
      mockServiceQuotas.getServiceQuota = jest.fn().mockReturnValue({ Quota: { Value: 1 } });
      await expect(
        appRegistryService.associateStackToAppRegistry(appRegistryName, stackName)
      ).resolves.not.toThrow();
      expect(mockServiceCatalogAppRegistry.associateResource).toHaveBeenCalledTimes(0);
    });
    test('Executes Successfully', async () => {
      await expect(
        appRegistryService.associateStackToAppRegistry(appRegistryName, stackName)
      ).resolves.not.toThrow();
      expect(mockServiceCatalogAppRegistry.associateResource).toHaveBeenCalledTimes(1);
    });
  });

  describe('disassociateStackToAppRegistry', () => {
    beforeEach(() => {
      mockServiceCatalogAppRegistry.getApplication = jest.fn().mockReturnValue(appRegistryApplication);
      mockCloudFormation.describeStacks = jest.fn().mockReturnValueOnce(stackDetails);
      mockServiceCatalogAppRegistry.disassociateResource = jest.fn().mockReturnValue({});
    });
    test('Do not throw when app registry application is not found', async () => {
      mockServiceCatalogAppRegistry.getApplication = jest
        .fn()
        .mockRejectedValueOnce(new Error('App Registry Not found'));
      await expect(
        appRegistryService.disassociateStackToAppRegistry(appRegistryName, stackName)
      ).resolves.not.toThrow();
      expect(mockServiceCatalogAppRegistry.disassociateResource).toHaveBeenCalledTimes(0);
    });
    test('Do not throw when stack is not found', async () => {
      mockCloudFormation.describeStacks = jest.fn().mockRejectedValueOnce(new Error('Stack Not found'));
      await expect(
        appRegistryService.disassociateStackToAppRegistry(appRegistryName, stackName)
      ).resolves.not.toThrow();
      expect(mockServiceCatalogAppRegistry.disassociateResource).toHaveBeenCalledTimes(0);
    });
    test('Executes Successfully', async () => {
      await expect(
        appRegistryService.disassociateStackToAppRegistry(appRegistryName, stackName)
      ).resolves.not.toThrow();
      expect(mockServiceCatalogAppRegistry.disassociateResource).toHaveBeenCalledTimes(1);
    });
  });
});
