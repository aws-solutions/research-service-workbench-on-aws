/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
jest.mock('../services/environmentTypeService');

import { AwsService } from '@aws/workbench-core-base';
import { EnvironmentTypeSetup } from '../index';

describe('EnvironmentTypeSetup', () => {
  const ORIGINAL_ENV = process.env;
  const portfolioName = 'swb-swbv2-va';

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.STACK_NAME = 'swb-swbv2-va';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  test('Throw exception when portfolio is empty', async () => {
    // BUILD
    const awsService = new AwsService({ region: 'us-east-1' });
    awsService.helpers.serviceCatalog.getPortfolioId = jest.fn().mockResolvedValue(undefined);
    awsService.helpers.serviceCatalog.getProductsByPortfolioId = jest.fn().mockResolvedValue([]);

    const environmentTypeHandler = new EnvironmentTypeSetup(awsService);

    // OPERATE
    await expect(environmentTypeHandler.run(portfolioName)).rejects.toThrowError(
      new Error(`Could not find portfolioId for portfolio: ${portfolioName}`)
    );
  });

  test('Throw exception when save EnvType parameters are empty', async () => {
    // BUILD
    const awsService = new AwsService({ region: 'us-east-1' });
    awsService.helpers.serviceCatalog.getPortfolioId = jest.fn().mockResolvedValue('portfolioTest');
    awsService.helpers.serviceCatalog.getProductsByPortfolioId = jest
      .fn()
      .mockResolvedValue([{ ProductId: '' }]);
    awsService.helpers.serviceCatalog.getProvisionArtifactsByProductId = jest
      .fn()
      .mockResolvedValue([{ Id: '', Active: true }]);
    awsService.helpers.serviceCatalog.getProvisionArtifactDetails = jest
      .fn()
      .mockResolvedValue({ Info: { TemplateUrl: 'www.test.com' } });
    awsService.helpers.s3.getTemplateByURL = jest.fn().mockResolvedValue({});

    const environmentTypeHandler = new EnvironmentTypeSetup(awsService);

    environmentTypeHandler['_getExistingEnvironmentType'] = jest.fn().mockResolvedValue(undefined);

    const saveMethod = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(EnvironmentTypeSetup.prototype as any, '_saveEnvironmentType');

    // OPERATE
    await expect(environmentTypeHandler.run(portfolioName)).resolves.not.toThrowError();

    //CHECK
    await expect(saveMethod).rejects.toThrow(
      new Error(
        `An error ocurred while saving an Environment Type, Product and Artifact Must not be empty, { Product: '', Provision Artifact: ''}`
      )
    );
  });

  test('Run successfully when there is a new provision artifact', async () => {
    // BUILD
    const awsService = new AwsService({ region: 'us-east-1' });
    awsService.helpers.serviceCatalog.getPortfolioId = jest.fn().mockResolvedValue('portfolioTest');
    awsService.helpers.serviceCatalog.getProductsByPortfolioId = jest
      .fn()
      .mockResolvedValue([{ ProductId: 'prod' }]);
    awsService.helpers.serviceCatalog.getProvisionArtifactsByProductId = jest
      .fn()
      .mockResolvedValue([{ Id: 'pa', Active: true }]);
    awsService.helpers.serviceCatalog.getProvisionArtifactDetails = jest
      .fn()
      .mockResolvedValue({ Info: { TemplateUrl: 'www.test.com' } });
    awsService.helpers.s3.getTemplateByURL = jest.fn().mockResolvedValue({});

    const environmentTypeHandler = new EnvironmentTypeSetup(awsService);

    environmentTypeHandler['_getExistingEnvironmentType'] = jest.fn().mockResolvedValueOnce(undefined);

    // OPERATE
    await expect(environmentTypeHandler.run(portfolioName)).resolves.not.toThrowError();
  });

  test('Do not save Environment Type when there is not a new provision artifact', async () => {
    // BUILD
    const awsService = new AwsService({ region: 'us-east-1' });
    awsService.helpers.serviceCatalog.getPortfolioId = jest.fn().mockResolvedValue('portfolioTest');
    awsService.helpers.serviceCatalog.getProductsByPortfolioId = jest
      .fn()
      .mockResolvedValue([{ ProductId: 'prod' }]);
    awsService.helpers.serviceCatalog.getProvisionArtifactsByProductId = jest
      .fn()
      .mockResolvedValue([{ Id: 'pa', Active: true }]);
    awsService.helpers.serviceCatalog.getProvisionArtifactDetails = jest
      .fn()
      .mockResolvedValue({ Info: { TemplateUrl: 'www.test.com' } });
    awsService.helpers.s3.getTemplateByURL = jest.fn().mockResolvedValue({});

    const environmentTypeHandler = new EnvironmentTypeSetup(awsService);

    environmentTypeHandler['_getExistingEnvironmentType'] = jest.fn().mockResolvedValue({
      id: 'test',
      productId: 'test',
      provisioningArtifactId: 'test'
    });
    const saveMethod = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(EnvironmentTypeSetup.prototype as any, '_saveEnvironmentType')
      .mockResolvedValueOnce(() => {});

    // OPERATE
    await expect(environmentTypeHandler.run(portfolioName)).resolves.not.toThrowError();

    // CHECK
    expect(saveMethod).not.toBeCalled();
  });
});
