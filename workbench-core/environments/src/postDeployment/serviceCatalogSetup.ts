/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-non-literal-fs-filename */

import crypto from 'crypto';
import fs from 'fs';

import { join, basename } from 'path';
import { Readable } from 'stream';
import { AwsService } from '@aws/workbench-core-base';
import { _Object } from '@aws-sdk/client-s3';
import { InvalidParametersException, ProductViewDetail } from '@aws-sdk/client-service-catalog';

import md5File from 'md5-file';

export default class ServiceCatalogSetup {
  private _aws: AwsService;
  private _constants: {
    AWS_REGION: string;
    S3_ARTIFACT_BUCKET_SC_PREFIX: string;
    SC_PORTFOLIO_NAME: string;
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY: string;
    STACK_NAME: string;
  };

  public constructor(constants: {
    AWS_REGION: string;
    S3_ARTIFACT_BUCKET_SC_PREFIX: string;
    SC_PORTFOLIO_NAME: string;
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY: string;
    STACK_NAME: string;
  }) {
    this._constants = constants;

    const { AWS_REGION } = constants;
    this._aws = new AwsService({ region: AWS_REGION });
  }

  public async run(cfnFilePaths: string[]): Promise<void> {
    const {
      S3_ARTIFACT_BUCKET_SC_PREFIX,
      SC_PORTFOLIO_NAME,
      STACK_NAME,
      LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
      S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY
    } = this._constants;
    const portfolioName = SC_PORTFOLIO_NAME;

    // Create SC portfolio if portfolio doesn't exist
    let portfolioId = await this._aws.helpers.serviceCatalog.getPortfolioId(portfolioName);
    if (portfolioId === undefined) {
      console.log('Creating new portfolio, because portfolio does not exist');
      portfolioId = await this._createSCPortfolio(portfolioName);
    }
    console.log('PortfolioId', portfolioId);

    const cfService = this._aws.helpers.cloudformation;
    const {
      [S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY]: s3ArtifactBucketArn,
      [LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY]: launchConstraintRoleName
    } = await cfService.getCfnOutput(STACK_NAME, [
      LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
      S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY
    ]);

    const prefix = S3_ARTIFACT_BUCKET_SC_PREFIX;

    const s3ArtifactBucketName = s3ArtifactBucketArn.split(':').pop() || '';

    // Upload environment's CFN templates to S3 if current template is different from template in S3
    const envTypeToFilePath = await this._getEnvTypeToUpdate(s3ArtifactBucketName, prefix, cfnFilePaths);
    await this._uploadTemplateToS3(s3ArtifactBucketName, prefix, Object.values(envTypeToFilePath));
    const envTypes: string[] = Object.keys(envTypeToFilePath);
    if (envTypes.length === 0) {
      console.log('No new environment type to update or add to Service Catalog portfolio');
      return;
    }

    // Create SC Products if needed. The SC product name will have the same name as the `envType`
    for (const productName of envTypes) {
      let productId = await this._getProductId(portfolioId, productName);
      if (productId) {
        console.log(`Updating product because product already exist: ${productName}`);
        await this._updateProduct(s3ArtifactBucketName, prefix, productName, productId);
      } else {
        console.log('Product does not exist, creating product and adding to portfolio');
        productId = await this._addProductsToPortfolio(
          s3ArtifactBucketName,
          prefix,
          productName,
          portfolioId
        );
      }

      // This is the role assumed by SC when launching a product
      console.log(`Create launch constraint for ${productName} if launch constraint does not exist`);
      await this._createLaunchConstraint(portfolioId, productId, launchConstraintRoleName);
    }
  }

  public getCfnTemplate(envFolderPath: string): string[] {
    // nosemgrep
    const fileAndDirInEnvFolder = fs.readdirSync(envFolderPath);
    // Each directory is an environment type
    const dirInEnvFolder = [];
    for (const name of fileAndDirInEnvFolder) {
      // nosemgrep
      const isDirectory = fs.lstatSync(join(envFolderPath, name)).isDirectory();
      if (isDirectory) {
        dirInEnvFolder.push(name);
      }
    }
    const cfnFilePaths = [];
    for (const directory of dirInEnvFolder) {
      // nosemgrep
      const cfnFileNames = fs.readdirSync(join(envFolderPath, directory)).filter((name) => {
        return name.slice(-8) === 'cfn.yaml';
      });
      if (cfnFileNames.length > 1) {
        throw Error('There should only be one cloudformation template in each environment type folder');
      }
      cfnFilePaths.push(join(envFolderPath, directory, cfnFileNames[0]));
    }
    return cfnFilePaths;
  }

  private async _createLaunchConstraint(
    portfolioId: string,
    productId: string,
    roleName: string
  ): Promise<void> {
    const lcParam = {
      PortfolioId: portfolioId,
      ProductId: productId,
      Type: 'LAUNCH',
      Parameters: `{"LocalRoleName": "${roleName}" }`
    };

    try {
      await this._aws.clients.serviceCatalog.createConstraint(lcParam);
    } catch (e) {
      if (
        e instanceof InvalidParametersException &&
        e.message === 'Only one constraint can be specified from these types: [LAUNCH, STACKSET]'
      ) {
        console.log(`Launch Constraint for ${productId} has already been created`);
      } else {
        throw e;
      }
    }
  }

  private async _uploadTemplateToS3(s3Bucket: string, prefix: string, filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      const fileName = basename(filePath);
      // nosemgrep
      const fileContent = fs.readFileSync(filePath);
      const putObjectParam = {
        Bucket: s3Bucket,
        Key: `${prefix}${fileName}`,
        Body: fileContent,
        ExpectedBucketOwner: process.env.MAIN_ACCT_ID
      };

      await this._aws.clients.s3.putObject(putObjectParam);
    }
  }

  private async _getEnvTypeToUpdate(
    s3Bucket: string,
    prefix: string,
    cfnFilePaths: string[]
  ): Promise<{ [key: string]: string }> {
    // By default up to 1000 files are returned. It's unlikely users will have more than 1000 environment types, which is
    // why we do not try to get more than 1000 files
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectscommandinput.html#maxkeys
    const listS3ObjectsParam = {
      Bucket: s3Bucket,
      Prefix: prefix,
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    };

    const listObjectOutput = await this._aws.clients.s3.listObjects(listS3ObjectsParam);
    const S3FileNameToMd5Sum: { [key: string]: string } = {};
    if (listObjectOutput.Contents) {
      for (let i = 0; i < listObjectOutput.Contents.length; i++) {
        // eslint-disable-next-line security/detect-object-injection
        const content: _Object = listObjectOutput.Contents[i];
        if (content.Key) {
          const getObjResponse = await this._aws.clients.s3.getObject({
            Bucket: s3Bucket,
            Key: content.Key,
            ExpectedBucketOwner: process.env.MAIN_ACCT_ID
          });
          const streamToString = (stream: Readable): Promise<string> =>
            new Promise((resolve, reject) => {
              const chunks: Uint8Array[] = [];
              stream.on('data', (chunk) => chunks.push(chunk));
              stream.on('error', reject);
              stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            });
          const s3FileMd5Sum: string = crypto
            .createHash('md5')
            .update(await streamToString(getObjResponse.Body! as Readable))
            .digest('hex');
          const S3FileName = content.Key.split('/').pop();
          if (S3FileName) {
            // eslint-disable-next-line security/detect-object-injection
            S3FileNameToMd5Sum[S3FileName] = s3FileMd5Sum;
          }
        }
      }
    }
    const envsToFilePath: { [key: string]: string } = {};
    cfnFilePaths.forEach((filePath: string) => {
      const fileName = basename(filePath);
      if (fileName) {
        const localCfnTemplateMd5Sum = md5File.sync(cfnFilePaths[0]);
        // eslint-disable-next-line security/detect-object-injection
        if (localCfnTemplateMd5Sum !== S3FileNameToMd5Sum[fileName]) {
          const envType = fileName.replace('.cfn.yaml', '');
          // eslint-disable-next-line security/detect-object-injection
          envsToFilePath[envType] = filePath;
        }
      }
    });
    return envsToFilePath;
  }

  private async _updateProduct(
    s3Bucket: string,
    prefix: string,
    productName: string,
    productId: string
  ): Promise<void> {
    const describeProductParam = {
      Id: productId
    };

    const product = await this._aws.clients.serviceCatalog.describeProductAsAdmin(describeProductParam);

    if (product.ProvisioningArtifactSummaries) {
      const names: string[] = product.ProvisioningArtifactSummaries.map((artifact) => {
        return artifact.Name!;
      });

      const largestVersionNumber: number | undefined = names
        .map((name) => {
          return Number(name.replace('v', ''));
        })
        .sort((a, b) => {
          return a - b;
        })
        .pop();

      if (largestVersionNumber === undefined) {
        throw new Error(`Product ${productId} has no product versions`);
      }

      //Update product version
      const newVersionName = `v${(largestVersionNumber + 1).toString()}`;
      const provisioningArtifactParam = {
        ProductId: productId,
        IdempotencyToken: `${productId}-${newVersionName}`,
        Parameters: {
          Name: newVersionName,
          DisableTemplateValidation: true,
          Info: {
            LoadTemplateFromURL: `https://${s3Bucket}.s3.amazonaws.com/${prefix}${productName}.cfn.yaml`
          },
          Type: 'CLOUD_FORMATION_TEMPLATE',
          Description: 'Auto-created by post deployment script'
        }
      };

      await this._aws.clients.serviceCatalog.createProvisioningArtifact(provisioningArtifactParam);
      console.log('Successfully created new version of product');
    }
  }

  private async _getProductId(portfolioId: string, productName: string): Promise<string | undefined> {
    const searchProductParam = {
      PortfolioId: portfolioId
    };

    const productsResponse = await this._aws.clients.serviceCatalog.searchProductsAsAdmin(searchProductParam);
    let product: ProductViewDetail | undefined = undefined;
    if (productsResponse.ProductViewDetails) {
      product = productsResponse.ProductViewDetails.find((detail: ProductViewDetail) => {
        return detail.ProductViewSummary ? detail.ProductViewSummary.Name === productName : false;
      });
    }
    return product && product.ProductViewSummary ? product.ProductViewSummary.ProductId : undefined;
  }

  private async _createSCPortfolio(portfolioName: string): Promise<string> {
    const portfolioToCreateParam = {
      DisplayName: portfolioName,
      ProviderName: '_system_',
      Description: 'Portfolio for managing RSW environments'
    };

    const response = await this._aws.clients.serviceCatalog.createPortfolio(portfolioToCreateParam);
    return response.PortfolioDetail!.Id!;
  }

  private async _addProductsToPortfolio(
    s3Bucket: string,
    prefix: string,
    productName: string,
    portfolioId: string
  ): Promise<string> {
    const productToCreateParam = {
      Name: productName,
      Description: 'Auto-created by post deployment script',
      Owner: '_system_',
      ProductType: 'CLOUD_FORMATION_TEMPLATE',
      ProvisioningArtifactParameters: {
        DisableTemplateValidation: true,
        Info: {
          LoadTemplateFromURL: `https://${s3Bucket}.s3.amazonaws.com/${prefix}${productName}.cfn.yaml`
        },
        Type: 'CLOUD_FORMATION_TEMPLATE',
        Name: 'v1',
        Description: 'Auto-created by post deployment script'
      }
    };
    const response = await this._aws.clients.serviceCatalog.createProduct(productToCreateParam);
    await this._associateProductWithPortfolio(
      response.ProductViewDetail!.ProductViewSummary!.ProductId!,
      portfolioId
    );
    return response.ProductViewDetail!.ProductViewSummary!.ProductId!;
  }

  private async _associateProductWithPortfolio(productId: string, portfolioId: string): Promise<void> {
    const associateProductParam = {
      PortfolioId: portfolioId,
      ProductId: productId
    };

    await this._aws.clients.serviceCatalog.associateProductWithPortfolio(associateProductParam);
  }
}
