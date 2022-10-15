/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProductViewSummary, ProvisioningArtifactDetail } from '@aws-sdk/client-service-catalog';
import { AwsService } from '@aws/workbench-core-base';
import EnvironmentTypeService from '../services/environmentTypeService';

interface ProvisionArtifactParams {
  Parameters: {
    [key: string]: {
      Type: string;
      Default?: string;
      AllowedValues?: string[];
      Description: string;
    };
  };
}

export default class EnvironmentTypeHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
  public async execute(event: any): Promise<void> {
    console.log(`Processing Environment Types`);
    const portfolioName = process.env.SC_PORTFOLIO_NAME!;
    const portfolioId = await this._mainAccountAwsService.helpers.serviceCatalog.getPortfolioId(
      portfolioName
    );
    if (portfolioId === undefined) {
      throw new Error(`Could not find portfolioId for portfolio: ${portfolioName}`);
    }
    console.log(`Processing portfolio ${portfolioId}`);
    const products = await this._mainAccountAwsService.helpers.serviceCatalog.getProductsByPortfolioId(
      portfolioId
    );
    for (const product of products) {
      try {
        console.log(`Processing product ${product.ProductId}`);
        const currentProductId = product.ProductId || '';
        const provisionArtifacts =
          await this._mainAccountAwsService.helpers.serviceCatalog.getProvisionArtifactsByProductId(
            currentProductId
          );
        for (const provisionArtifact of provisionArtifacts.filter((p) => p.Active)) {
          try {
            console.log(`Processing provision artifact ${provisionArtifact.Id}-${product.ProductId}`);
            const details =
              await this._mainAccountAwsService.helpers.serviceCatalog.getProvisionArtifactDetails(
                currentProductId,
                provisionArtifact.Id || ''
              );
            const envTypeId = `et-${product.ProductId},${provisionArtifact.Id}`;
            const existingEnvType = await this._getExistingEnvironmentType(envTypeId);
            if (!existingEnvType && !!details?.Info?.TemplateUrl) {
              console.log(`Creating environment type: ${envTypeId}.`);
              const params = await this._mainAccountAwsService.helpers.s3.getTemplateByURL(
                details.Info.TemplateUrl
              );
              await this._saveEnvironmentType(product, provisionArtifact, params as ProvisionArtifactParams);
            }
          } catch (e) {
            console.log(
              `An error ocurred while trying to process Provision Artifact: ${provisionArtifact.Id} - ${e}`
            ); //continue process when a provision artifact fails
          }
        }
      } catch (e) {
        console.log(`An error ocurred while trying to process Product: ${product.ProductId} - ${e}`); //continue process when a product fails
      }
    }
  }

  private async _saveEnvironmentType(
    product: ProductViewSummary,
    provisionArtifact: ProvisioningArtifactDetail,
    provisionParams: ProvisionArtifactParams
  ): Promise<void> {
    const envTypeService = new EnvironmentTypeService({ TABLE_NAME: process.env.STACK_NAME! });
    await envTypeService.createNewEnvironmentType({
      productId: product.ProductId || '',
      provisioningArtifactId: provisionArtifact.Id || '',
      description: provisionArtifact.Description || '',
      name: `${product.Name}-${provisionArtifact.Name}`,
      type: product.Name || '',
      params: provisionParams.Parameters,
      status: 'NOT_APPROVED'
    });
  }

  private async _getExistingEnvironmentType(envTypeId: string): Promise<
    | {
        id: string;
        productId: string;
        provisioningArtifactId: string;
      }
    | undefined
  > {
    let environmentType:
      | {
          id: string;
          productId: string;
          provisioningArtifactId: string;
        }
      | undefined = undefined;
    const envTypeService = new EnvironmentTypeService({ TABLE_NAME: process.env.STACK_NAME! });

    try {
      console.log(`Searching for environment type: ${envTypeId}`);
      const envType = await envTypeService.getEnvironmentType(envTypeId);
      environmentType = {
        id: envType.id,
        productId: envType.productId,
        provisioningArtifactId: envType.provisioningArtifactId
      };
      console.log(`Environment type: ${envTypeId} found.`);
      return environmentType;
    } catch {
      console.log(`Environment type: ${envTypeId} not found.`);
      return undefined;
    }
  }
}
