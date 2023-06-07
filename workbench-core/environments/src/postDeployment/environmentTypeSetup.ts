/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, resourceTypeToKey, CFNTemplateParameters } from '@aws/workbench-core-base';
import { ProductViewSummary, ProvisioningArtifactDetail } from '@aws-sdk/client-service-catalog';
import { EnvironmentType } from '../models/environmentTypes/environmentType';
import EnvironmentTypeService from '../services/environmentTypeService';

export default class EnvironmentTypeSetup {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  public async run(portfolioName: string): Promise<void> {
    console.log(`Processing Environment Types`);
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
            const envTypeId = `${resourceTypeToKey.envType.toLowerCase()}-${product.ProductId},${
              provisionArtifact.Id
            }`;
            const existingEnvType = await this._getExistingEnvironmentType(envTypeId);
            if (!existingEnvType && !!details?.Info?.TemplateUrl) {
              console.log(`Creating environment type: ${envTypeId}.`);
              const params = await this._mainAccountAwsService.helpers.s3.getTemplateByURL(
                details.Info.TemplateUrl
              );
              await this._saveEnvironmentType(product, provisionArtifact, params?.Parameters);
            }
          } catch (e) {
            console.log(
              `An error ocurred while trying to process Provision Artifact: ${
                provisionArtifact.Id
              } - ${JSON.stringify(e)}`
            ); //continue process when a provision artifact fails
          }
        }
      } catch (e) {
        console.log(
          `An error ocurred while trying to process Product: ${product.ProductId} - ${JSON.stringify(e)}`
        ); //continue process when a product fails
      }
    }
  }

  private async _saveEnvironmentType(
    product: ProductViewSummary,
    provisionArtifact: ProvisioningArtifactDetail,
    provisionParams?: CFNTemplateParameters
  ): Promise<void> {
    if (!product?.ProductId || !provisionArtifact?.Id) {
      throw new Error(
        `An error ocurred while saving an Environment Type, Product and Artifact Must not be empty, { Product: '${
          product?.ProductId ?? ''
        }', Provision Artifact: '${provisionArtifact?.Id ?? ''}'}`
      );
    }
    const envTypeService = new EnvironmentTypeService(this._mainAccountAwsService.helpers.ddb);
    await envTypeService.createNewEnvironmentType({
      productId: product.ProductId,
      provisioningArtifactId: provisionArtifact.Id,
      description: provisionArtifact.Description || '',
      name: `${product.Name}-${provisionArtifact.Name}`,
      type: product.Name || '',
      params: provisionParams ?? {},
      status: 'NOT_APPROVED'
    });
  }

  private async _getExistingEnvironmentType(envTypeId: string): Promise<EnvironmentType | undefined> {
    const envTypeService = new EnvironmentTypeService(this._mainAccountAwsService.helpers.ddb);
    try {
      console.log(`Searching for environment type: ${envTypeId}`);
      const envType = await envTypeService.getEnvironmentType(envTypeId);
      console.log(`Environment type: ${envTypeId} found.`);
      return envType;
    } catch {
      console.log(`Environment type: ${envTypeId} not found.`);
      return undefined;
    }
  }
}
