import { AwsService } from '@amzn/workbench-core-base';
import IamRoleCloneService from './iamRoleCloneService';
import { getCfnOutput } from './cloudformationUtil';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';
export default class AccountHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  // TODO: Consider moving these methods to `hostingAccountLifecycleService`
  // TODO: Take a look at this https://quip-amazon.com/5SbZAHDcaw0m/Account-Class-Architecture
  /* eslint-disable-next-line */
  public async execute(event: any): Promise<void> {
    /*
     * [Done] Share SC portfolio with hosting accounts that doesn't already have SC portfolio from main account
     * [Done] Hosting account accept portfolio (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/accept-portfolio-share.html) that was shared
     * [Done] In hosting account, associate envManagement IAM role to SC portfolio (API (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/associate-principal-with-portfolio.html))(Example code (https://github.com/awslabs/service-workbench-on-aws/blob/5afa5a68ac8fdb4939864e52a5b13cfc0b227118/addons/addon-environment-sc-api/packages/environment-sc-workflow-steps/lib/steps/share-portfolio-with-target-acc/share-portfolio-with-target-acc.js#L84) from SWBv1)
     * [Done] Copy LaunchConstraint role to hosting accounts that doesn't already have the role
     * [Done] Share SSM documents with all hosting accounts that does not have the SSM document already
     * [Done] Share all AMIs in this https://quip-amazon.com/HOa9A1K99csF/Environment-Management-Design#temp:C:HDIfa98490bd9047f0d9bfd43ee0 with all hosting account
     * Check if all hosting accounts have updated onboard-account.cfn.yml template. If the hosting accounts does not, update hosting account status to be Needs Update
     * Add hosting account VPC and Subnet ID to DDB
     */

    // eslint-disable-next-line
    const { hostingAccountArns, externalId, portfolioId } = await this._getMetadataFromDB();
    const hostingAccountLifecycleService = new HostingAccountLifecycleService(
      process.env.AWS_REGION!,
      process.env.STACK_NAME!
    );
    const { [process.env.LAUNCH_CONSTRAINT_ROLE_NAME!]: launchConstraintRoleName } = await getCfnOutput(
      this._mainAccountAwsService,
      process.env.STACK_NAME!,
      [process.env.LAUNCH_CONSTRAINT_ROLE_NAME!]
    );
    for (const hostingAccountArn of hostingAccountArns) {
      const hostingAccountId = this._getAccountId(hostingAccountArn.accountHandler);
      const hostingAccountAwsService = await this._mainAccountAwsService.getAwsServiceForRole({
        roleArn: hostingAccountArn.accountHandler,
        roleSessionName: 'account-handler',
        externalId: externalId as string,
        region: process.env.AWS_REGION!
      });
      await this._shareAndAcceptScPortfolio(
        hostingAccountAwsService,
        hostingAccountId as string,
        portfolioId as string
      );
      await this._associateIamRoleWithPortfolio(
        hostingAccountAwsService,
        hostingAccountArn.envManagement,
        portfolioId as string
      );

      const iamRoleCloneService = new IamRoleCloneService(
        this._mainAccountAwsService,
        hostingAccountAwsService
      );
      await iamRoleCloneService.cloneRole(launchConstraintRoleName);
      await hostingAccountLifecycleService.updateAccount(hostingAccountId, process.env.SSM_DOC_NAME_SUFFIX!);
    }
  }

  private async _associateIamRoleWithPortfolio(
    hostingAccountAwsService: AwsService,
    iamRole: string,
    portfolioId: string
  ): Promise<void> {
    console.log(`Associating ${iamRole} with porfolio ${portfolioId}`);
    await hostingAccountAwsService.serviceCatalog.associatePrincipalWithPortfolio({
      PortfolioId: portfolioId,
      PrincipalARN: iamRole,
      PrincipalType: 'IAM'
    });
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

  private _getAccountId(iamRoleArn: string): string {
    const match = iamRoleArn.match(/::(\d{12}):role/);
    if (match) {
      return match[1];
    }
    throw new Error(`Cannot find accountId from arn: ${iamRoleArn}`);
  }

  // eslint-disable-next-line
  private async _getMetadataFromDB(): Promise<{ [key: string]: any }> {
    // TODO: Get this data from DDB
    return Promise.resolve({
      externalId: 'workbench',
      hostingAccountArns: [
        {
          accountHandler: 'arn:aws:iam::750404249455:role/swb-dev-oh-cross-account-role',
          envManagement: 'arn:aws:iam::750404249455:role/swb-dev-oh-xacc-env-mgmt'
        }
      ],
      portfolioId: 'port-4n4g66unobu34',
      hostingAccountId: '750404249455' // TODO: This value van be obtained from the hostingAccountIamRolArn
    });
  }
}
