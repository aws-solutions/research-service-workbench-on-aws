import {
  AssociatePrincipalWithPortfolioCommand,
  AssociatePrincipalWithPortfolioCommandInput,
  AssociatePrincipalWithPortfolioCommandOutput,
  AssociateProductWithPortfolioCommand,
  AssociateProductWithPortfolioCommandInput,
  AssociateProductWithPortfolioCommandOutput,
  CreateConstraintCommand,
  CreateConstraintCommandInput,
  CreateConstraintCommandOutput,
  CreatePortfolioCommand,
  CreatePortfolioCommandInput,
  CreatePortfolioCommandOutput,
  CreateProductCommand,
  CreateProductCommandInput,
  CreateProductCommandOutput,
  CreateProvisioningArtifactCommand,
  CreateProvisioningArtifactInput,
  CreateProvisioningArtifactOutput,
  DescribeProductAsAdminCommand,
  DescribeProductAsAdminCommandOutput,
  DescribeProductAsAdminInput,
  ListPortfoliosCommand,
  ListPortfoliosCommandInput,
  ListPortfoliosCommandOutput,
  SearchProductsAsAdminCommand,
  SearchProductsAsAdminCommandInput,
  SearchProductsAsAdminCommandOutput,
  ServiceCatalogClient,
  ServiceCatalogClientConfig
} from '@aws-sdk/client-service-catalog';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-service-catalog/index.html
export default class ServiceCatalog {
  private _client: ServiceCatalogClient;
  public constructor(config: ServiceCatalogClientConfig) {
    this._client = new ServiceCatalogClient(config);
  }

  public async createConstraint(
    params: CreateConstraintCommandInput
  ): Promise<CreateConstraintCommandOutput> {
    return this._client.send(new CreateConstraintCommand(params));
  }

  public async describeProductAsAdmin(
    params: DescribeProductAsAdminInput
  ): Promise<DescribeProductAsAdminCommandOutput> {
    return this._client.send(new DescribeProductAsAdminCommand(params));
  }

  public async createProvisioningArtifact(
    params: CreateProvisioningArtifactInput
  ): Promise<CreateProvisioningArtifactOutput> {
    return this._client.send(new CreateProvisioningArtifactCommand(params));
  }

  public async searchProductsAsAdmin(
    params: SearchProductsAsAdminCommandInput
  ): Promise<SearchProductsAsAdminCommandOutput> {
    return this._client.send(new SearchProductsAsAdminCommand(params));
  }

  public async listPortfolios(params: ListPortfoliosCommandInput): Promise<ListPortfoliosCommandOutput> {
    return this._client.send(new ListPortfoliosCommand(params));
  }

  public async createPortfolio(params: CreatePortfolioCommandInput): Promise<CreatePortfolioCommandOutput> {
    return this._client.send(new CreatePortfolioCommand(params));
  }

  public async createProduct(params: CreateProductCommandInput): Promise<CreateProductCommandOutput> {
    return this._client.send(new CreateProductCommand(params));
  }

  public async associateProductWithPorfolio(
    params: AssociateProductWithPortfolioCommandInput
  ): Promise<AssociateProductWithPortfolioCommandOutput> {
    return this._client.send(new AssociateProductWithPortfolioCommand(params));
  }

  public async associatePrincipalWithPortfolio(
    params: AssociatePrincipalWithPortfolioCommandInput
  ): Promise<AssociatePrincipalWithPortfolioCommandOutput> {
    return this._client.send(new AssociatePrincipalWithPortfolioCommand(params));
  }
}
