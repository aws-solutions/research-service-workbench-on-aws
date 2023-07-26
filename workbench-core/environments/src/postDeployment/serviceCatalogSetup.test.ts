/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('md5-file');

import { Readable } from 'stream';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { GetObjectCommand, ListObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import {
  CreateConstraintCommand,
  CreatePortfolioCommand,
  CreateProductCommand,
  ListPortfoliosCommand,
  SearchProductsAsAdminCommand,
  ServiceCatalogClient,
  AssociateProductWithPortfolioCommand,
  DescribeProductAsAdminCommand,
  CreateProvisioningArtifactCommand
} from '@aws-sdk/client-service-catalog';
import { SdkStream } from '@aws-sdk/types';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import md5File from 'md5-file';
import ServiceCatalogSetup from './serviceCatalogSetup';

describe('ServiceCatalogSetup', () => {
  const constants = {
    AWS_REGION: 'us-east-1',
    S3_ARTIFACT_BUCKET_SC_PREFIX: 'service-catalog-cfn-templates/',
    SC_PORTFOLIO_NAME: 'rsw-dev-va',
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: 'S3BucketArtifactsArnOutput',
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY: 'LaunchConstraintIamRoleNameOutput',
    STACK_NAME: 'rsw-dev-va'
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mockCloudformationOutputs(cfMock: AwsStub<any, any>): void {
    cfMock.on(DescribeStacksCommand).resolves({
      Stacks: [
        {
          StackName: 'rsw-dev-va',
          StackStatus: 'CREATE_COMPLETE',
          CreationTime: new Date(),
          Outputs: [
            {
              OutputKey: constants.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
              OutputValue: 'arn:aws:s3:::rsw-dev-va-s3artifacts'
            },
            {
              OutputKey: constants.LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
              OutputValue: 'rsw-dev-va-LaunchConstraint'
            }
          ]
        }
      ]
    });
  }
  const cfMock = mockClient(CloudFormationClient);
  beforeAll(() => {
    mockCloudformationOutputs(cfMock);
  });

  afterAll(() => {
    cfMock.reset();
  });

  describe('Mocked private methods', () => {
    test('run: Create new portfolio, add new product, add launch constraint', async () => {
      const sc = new ServiceCatalogSetup(constants);
      // Mock no portfolio
      const scMock = mockClient(ServiceCatalogClient);
      scMock.on(ListPortfoliosCommand).resolves({ PortfolioDetails: [] });
      sc['_createSCPortfolio'] = jest.fn().mockResolvedValue('port-abc');
      sc['_getEnvTypeToUpdate'] = jest
        .fn()
        .mockResolvedValue({ sagemakerNotebook: 'environments/sagemaker.cfn.yaml' });
      sc['_uploadTemplateToS3'] = jest.fn().mockResolvedValue({});
      sc['_getProductId'] = jest.fn().mockResolvedValue(undefined);
      sc['_addProductsToPortfolio'] = jest.fn().mockResolvedValue('prod-123');
      sc['_createLaunchConstraint'] = jest.fn().mockResolvedValue({});
      await expect(sc.run(['./environments/sagemaker.cfn.yaml'])).resolves.not.toThrowError();
    });

    test('run: Porfolio already exist, add new product, add launch constraint', async () => {
      const sc = new ServiceCatalogSetup(constants);
      //Mock portfolio already exist
      const scMock = mockClient(ServiceCatalogClient);
      scMock.on(ListPortfoliosCommand).resolves({
        PortfolioDetails: [
          {
            DisplayName: 'rsw-dev-va',
            Id: 'port-abc'
          }
        ]
      });
      sc['_getEnvTypeToUpdate'] = jest
        .fn()
        .mockResolvedValue({ sagemakerNotebook: 'environments/sagemaker.cfn.yaml' });
      sc['_uploadTemplateToS3'] = jest.fn().mockResolvedValue({});
      sc['_getProductId'] = jest.fn().mockResolvedValue(undefined);
      sc['_addProductsToPortfolio'] = jest.fn().mockResolvedValue('prod-123');
      sc['_createLaunchConstraint'] = jest.fn().mockResolvedValue({});
      await expect(sc.run(['./environments/sagemaker.cfn.yaml'])).resolves.not.toThrowError();
    });

    test('run: Porfolio already exist, product already exist, updating product, add launch constraint', async () => {
      const sc = new ServiceCatalogSetup(constants);
      //Mock portfolio already exist
      const scMock = mockClient(ServiceCatalogClient);
      scMock.on(ListPortfoliosCommand).resolves({
        PortfolioDetails: [
          {
            DisplayName: 'rsw-dev-va',
            Id: 'port-abc'
          }
        ]
      });
      sc['_getEnvTypeToUpdate'] = jest
        .fn()
        .mockResolvedValue({ sagemakerNotebook: 'environments/sagemaker.cfn.yaml' });
      sc['_uploadTemplateToS3'] = jest.fn().mockResolvedValue({});
      sc['_getProductId'] = jest.fn().mockResolvedValue('prod-123');
      sc['_updateProduct'] = jest.fn().mockResolvedValue(undefined);
      sc['_createLaunchConstraint'] = jest.fn().mockResolvedValue({});
      await expect(sc.run(['./environments/sagemaker.cfn.yaml'])).resolves.not.toThrowError();
    });
  });

  describe('execute private methods', () => {
    test('run: Create new portfolio, add new product, add launch constraint', async () => {
      const sc = new ServiceCatalogSetup(constants);
      const scMock = mockClient(ServiceCatalogClient);
      const s3Mock = mockClient(S3Client);

      // Mock no portfolio
      scMock.on(ListPortfoliosCommand).resolves({ PortfolioDetails: [] });

      // Mock create portfolio
      scMock.on(CreatePortfolioCommand).resolves({
        PortfolioDetail: {
          Id: 'port-abc'
        }
      });

      // Mock Get S3 files
      s3Mock.on(ListObjectsCommand).resolves({
        Contents: []
      });
      md5File.sync = jest.fn(() => {
        return 'abc123';
      });

      // Mock upload cfn template to S3
      sc['_uploadTemplateToS3'] = jest.fn().mockResolvedValue({});

      // Mock SC Product does not exist
      scMock.on(SearchProductsAsAdminCommand).resolves({
        ProductViewDetails: []
      });

      // Mock Create SC Product
      scMock.on(CreateProductCommand).resolves({
        ProductViewDetail: {
          ProductViewSummary: {
            ProductId: 'prod-617'
          }
        }
      });

      // Mock add SC Product to SC Portfolio
      scMock.on(AssociateProductWithPortfolioCommand).resolves({});

      // Mock Create Launch Constraint
      scMock.on(CreateConstraintCommand).resolves({});

      await expect(sc.run(['./environments/sagemaker.cfn.yaml'])).resolves.not.toThrowError();
    });

    test('run: Create new portfolio, update product, add launch constraint', async () => {
      const sc = new ServiceCatalogSetup(constants);
      const scMock = mockClient(ServiceCatalogClient);
      const s3Mock = mockClient(S3Client);

      // Mock no portfolio
      scMock.on(ListPortfoliosCommand).resolves({ PortfolioDetails: [] });

      // Mock create portfolio
      scMock.on(CreatePortfolioCommand).resolves({
        PortfolioDetail: {
          Id: 'port-abc'
        }
      });

      // Mock Get S3 files
      s3Mock.on(ListObjectsCommand).resolves({
        Contents: []
      });
      md5File.sync = jest.fn(() => {
        return 'abc123';
      });

      // Mock upload cfn template to S3
      sc['_uploadTemplateToS3'] = jest.fn().mockResolvedValue({});

      // Mock SC Product DOES exist
      scMock.on(SearchProductsAsAdminCommand).resolves({
        ProductViewDetails: [
          {
            ProductViewSummary: {
              Name: 'sagemaker',
              ProductId: 'prod-617'
            }
          }
        ]
      });

      // Mock Update SC Product
      scMock.on(DescribeProductAsAdminCommand).resolves({
        ProvisioningArtifactSummaries: [
          {
            Name: 'v1'
          }
        ]
      });
      scMock.on(CreateProvisioningArtifactCommand).resolves({});

      // Mock add SC Product to SC Portfolio
      scMock.on(AssociateProductWithPortfolioCommand).resolves({});

      // Mock Create Launch Constraint
      scMock.on(CreateConstraintCommand).resolves({});

      await expect(sc.run(['./environments/sagemaker.cfn.yaml'])).resolves.not.toThrowError();
    });

    test('run: Portfolio already exist, product does not need to be updated, add launch constraint', async () => {
      const sc = new ServiceCatalogSetup(constants);
      const scMock = mockClient(ServiceCatalogClient);
      const s3Mock = mockClient(S3Client);

      // Mock portfolio already exist
      scMock.on(ListPortfoliosCommand).resolves({
        PortfolioDetails: [
          {
            DisplayName: 'rsw-dev-va',
            Id: 'port-abc'
          }
        ]
      });

      // Mock Get List of S3 files
      s3Mock.on(ListObjectsCommand).resolves({
        Contents: [
          {
            Key: `${constants.S3_ARTIFACT_BUCKET_SC_PREFIX}sagemaker.cfn.yaml`
          }
        ]
      });

      // Mock Reading S3 File
      const readableStream = new Readable({
        read() {}
      });

      readableStream.push('ABC');
      readableStream.push(null);

      s3Mock.on(GetObjectCommand).resolves({
        Body: readableStream as SdkStream<Readable>
      });

      // MD5 Sum of S3 file
      md5File.sync = jest.fn(() => {
        return '902fbdd2b1df0c4f70b4a5d23525e932';
      });

      // Mock Create Launch Constraint
      scMock.on(CreateConstraintCommand).resolves({});

      await expect(sc.run(['./environments/sagemaker.cfn.yaml'])).resolves.not.toThrowError();
    });
  });
});
