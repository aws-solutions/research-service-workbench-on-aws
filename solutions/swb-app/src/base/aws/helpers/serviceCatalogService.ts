/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  ServiceCatalog,
  ListPortfoliosCommandInput,
  PortfolioDetail,
  ProductViewSummary,
  ProvisioningArtifactDetail,
  SearchProductsAsAdminCommandInput,
  ProductViewDetail,
  DescribeProvisioningArtifactCommandOutput
} from '@aws-sdk/client-service-catalog';

export default class ServiceCatalogService {
  private _serviceCatalog: ServiceCatalog;
  public constructor(serviceCatalog: ServiceCatalog) {
    this._serviceCatalog = serviceCatalog;
  }

  /**
   * Get portfolioId of a portfolio
   * @param portfolioName - name of the portfolio
   */
  public async getPortfolioId(portfolioName: string): Promise<string | undefined> {
    let portfolioDetails: PortfolioDetail[] = [];
    let pageToken: string | undefined = undefined;
    // Get all portfolios in the account
    do {
      const listPortfolioInput: ListPortfoliosCommandInput = {
        PageToken: pageToken,
        PageSize: 20
      };
      const listPortfolioOutput = await this._serviceCatalog.listPortfolios(listPortfolioInput);
      pageToken = listPortfolioOutput.NextPageToken;
      if (listPortfolioOutput.PortfolioDetails) {
        portfolioDetails = portfolioDetails.concat(listPortfolioOutput.PortfolioDetails);
      }
    } while (pageToken);

    // Find the SWB portfolio
    const portfolio = portfolioDetails.find((portfolio: PortfolioDetail) => {
      return portfolio.DisplayName === portfolioName;
    });

    return portfolio ? portfolio.Id : undefined;
  }

  /**
   * Get portfolio products
   * @param portfolioId - Id of the portfolio
   */
  public async getProductsByPortfolioId(portfolioId: string): Promise<ProductViewSummary[]> {
    let productsDetails: ProductViewDetail[] = [];
    let pageToken: string | undefined = undefined;
    // Get all products within portfolio
    do {
      const productsFilter: SearchProductsAsAdminCommandInput = {
        PageToken: pageToken,
        PageSize: 20,
        SortBy: 'CreationDate',
        SortOrder: 'DESCENDING',
        PortfolioId: portfolioId
      };
      const productList = await this._serviceCatalog.searchProductsAsAdmin(productsFilter);
      pageToken = productList.NextPageToken;
      if (productList.ProductViewDetails) {
        productsDetails = productsDetails.concat(productList.ProductViewDetails);
      }
    } while (pageToken);
    return productsDetails.filter((p) => !!p.ProductViewSummary).map((p) => p.ProductViewSummary || {});
  }

  /**
   * Get provision artifacts by product
   * @param productId - Id of the portfolio
   */
  public async getProvisionArtifactsByProductId(productId: string): Promise<ProvisioningArtifactDetail[]> {
    const provisionArtifactList = await this._serviceCatalog.listProvisioningArtifacts({
      ProductId: productId
    });
    return provisionArtifactList.ProvisioningArtifactDetails || [];
  }

  /**
   * Get provision artifacts details
   * @param productId - Id of the product
   * @param provisionArtifactId - Id of the provision Artifact
   */
  public async getProvisionArtifactDetails(
    productId: string,
    provisionArtifactId: string
  ): Promise<DescribeProvisioningArtifactCommandOutput> {
    const provisionArtifactList = await this._serviceCatalog.describeProvisioningArtifact({
      ProductId: productId,
      ProvisioningArtifactId: provisionArtifactId
    });
    return provisionArtifactList;
  }
}
