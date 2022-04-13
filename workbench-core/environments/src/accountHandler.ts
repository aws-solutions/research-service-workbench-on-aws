import { AwsService } from '@amzn/workbench-core-base';

export default class AccountHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  /* eslint-disable-next-line */
  public async execute(event: any): Promise<void> {
    /*
     * Share SC portfolio with hosting accounts that doesn't already have SC portfolio from main account
     * Hosting account accept portfolio (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/accept-portfolio-share.html) that was shared
     * In hosting account, associate envManagement IAM role to SC portfolio (API (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/associate-principal-with-portfolio.html))(Example code (https://github.com/awslabs/service-workbench-on-aws/blob/5afa5a68ac8fdb4939864e52a5b13cfc0b227118/addons/addon-environment-sc-api/packages/environment-sc-workflow-steps/lib/steps/share-portfolio-with-target-acc/share-portfolio-with-target-acc.js#L84) from SWBv1)
     * Copy LaunchConstraint role to hosting accounts that doesn't already have the role
     * Share SSM documents with all hosting accounts that does not have the SSM document already
     * Share all AMIs in this https://quip-amazon.com/HOa9A1K99csF/Environment-Management-Design#temp:C:HDIfa98490bd9047f0d9bfd43ee0 with all hosting account
     * Check if all hosting accounts have updated onboard-account.cfn.yml template. If the hosting accounts does not, update hosting account status to be Needs Update
     * Add hosting account VPC and Subnet ID to DDB
     */

    // TODO: Get value from DDB
    const portfolioId = 'port-4n4g66unobu34';
    const [iamRoleArn] = await this._getHostingAccountIamRole();
    // TODO: Get this value from the hosting accoutn role arn
    const hostingAccountId = '750404249455';
    const hostingAccountAwsService = await this._mainAccountAwsService.getAwsServiceForRole({
      roleArn: iamRoleArn,
      roleSessionName: 'account-handler',
      externalId: 'workbench',
      region: process.env.AWS_REGION!
    });
    await this._shareAndAcceptScPortfolio(hostingAccountAwsService, hostingAccountId, portfolioId);
  }

  /**
   * Get list of all hosting account IAM roles
   * @returns List of all hosting account IAM roles
   */
  private async _getHostingAccountIamRole(): Promise<string[]> {
    //TODO: Get this from DDB

    return Promise.resolve(['arn:aws:iam::750404249455:role/swb-dev-oh-cross-account-role']);
  }

  private async _shareAndAcceptScPortfolio(
    hostingAccountAwsService: AwsService,
    hostingAccountId: string,
    portfolioId: string
  ): Promise<void> {
    console.log(`Sharing Service Catalog Portfolio ${portfolioId} with account ${hostingAccountId} `);
    await this._mainAccountAwsService.serviceCatalog.createPortfolioShare({
      PortfolioId: portfolioId,
      AccountId: hostingAccountId
    });

    await hostingAccountAwsService.serviceCatalog.acceptPortfolioShare({ PortfolioId: portfolioId });
  }
}
