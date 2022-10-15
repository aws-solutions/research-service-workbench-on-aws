/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AwsService } from '@aws/workbench-core-base';
import { EnvironmentTypeHandler } from '..';

describe('EnvironmentTypeHandler', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.SC_PORTFOLIO_NAME = 'swb-swbv2-va';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });
  test('Save new Environment type when there is a new provision artifact ', async () => {
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

    const environmentTypeHandler = new EnvironmentTypeHandler(awsService);

    environmentTypeHandler['_getExistingEnvironmentType'] = jest.fn().mockResolvedValue(undefined);

    const saveMethod = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(EnvironmentTypeHandler.prototype as any, '_saveEnvironmentType')
      .mockImplementation(() => {});

    // OPERATE
    await expect(environmentTypeHandler.execute({})).resolves.not.toThrowError();

    // CHECK
    expect(saveMethod).toBeCalledTimes(1);
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

    const environmentTypeHandler = new EnvironmentTypeHandler(awsService);

    environmentTypeHandler['_getExistingEnvironmentType'] = jest.fn().mockResolvedValue({
      id: 'test',
      productId: 'test',
      provisioningArtifactId: 'test'
    });
    const saveMethod = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(EnvironmentTypeHandler.prototype as any, '_saveEnvironmentType')
      .mockImplementation(() => {});

    // OPERATE
    await expect(environmentTypeHandler.execute({})).resolves.not.toThrowError();

    // CHECK
    expect(saveMethod).not.toBeCalled();
  });
});
