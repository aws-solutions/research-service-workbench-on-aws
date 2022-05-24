import { AwsService } from '@amzn/workbench-core-base';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';
import AccountService from './accountService';
import { ListPortfoliosCommandInput, PortfolioDetail } from '@aws-sdk/client-service-catalog';
export default class AccountHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
  public async execute(event: any): Promise<void> {
    // eslint-disable-next-line
    // const { hostingAccounts, externalId, portfolioId } = await this._getMetadataFromDB();
    const hostingAccounts = await this._getAccountMetadata();
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const portfolioId = await this._getPortfolioId();

    // const cfService = new CloudformationService(this._mainAccountAwsService.clients.cloudformation);
    const cfService = this._mainAccountAwsService.helpers.cloudformation;
    const {
      [process.env.LAUNCH_CONSTRAINT_ROLE_NAME!]: launchConstraintRoleName,
      [process.env.S3_ARTIFACT_BUCKET_ARN_NAME!]: s3ArtifactBucketArn
    } = await cfService.getCfnOutput(process.env.STACK_NAME!, [
      process.env.LAUNCH_CONSTRAINT_ROLE_NAME!,
      process.env.S3_ARTIFACT_BUCKET_ARN_NAME!
    ]);

    for (const hostingAccount of hostingAccounts) {
      const hostingAccountId = this._getAccountId(hostingAccount.accountHandlerRoleArn);
      let hostingAccountAwsService: AwsService;
      try {
        hostingAccountAwsService = await this._mainAccountAwsService.getAwsServiceForRole({
          roleArn: hostingAccount.accountHandlerRoleArn,
          roleSessionName: 'account-handler',
          externalId: hostingAccount.externalId,
          region: process.env.AWS_REGION!
        });
      } catch (e) {
        console.log(
          `Cannot assume role ${hostingAccount.accountHandlerRoleArn} for hosting account. Skipping setup for this account`
        );
        continue;
      }

      const s3ArtifactBucketName = s3ArtifactBucketArn.split(':').pop() || '';
      await hostingAccountLifecycleService.updateAccount({
        targetAccountId: hostingAccountId,
        targetAccountAwsService: hostingAccountAwsService,
        targetAccountStackName: hostingAccount.stackName,
        portfolioId,
        ssmDocNameSuffix: process.env.SSM_DOC_NAME_SUFFIX!,
        principalArnForScPortfolio: hostingAccount.envMgmtRoleArn,
        roleToCopyToTargetAccount: launchConstraintRoleName,
        s3ArtifactBucketName
      });
    }
  }

  private _getAccountId(iamRoleArn: string): string {
    const match = iamRoleArn.match(/::(\d{12}):role/);
    if (match) {
      return match[1];
    }
    throw new Error(`Cannot find accountId from arn: ${iamRoleArn}`);
  }

  private async _getPortfolioId(): Promise<string> {
    let portfolioDetails: PortfolioDetail[] = [];
    let pageToken: string | undefined = undefined;
    // Get all portfolios in the account
    do {
      const listPortfolioInput: ListPortfoliosCommandInput = {
        PageToken: pageToken,
        PageSize: 20
      };
      const listPortfolioOutput = await this._mainAccountAwsService.clients.serviceCatalog.listPortfolios(
        listPortfolioInput
      );
      pageToken = listPortfolioOutput.NextPageToken;
      if (listPortfolioOutput.PortfolioDetails) {
        portfolioDetails = portfolioDetails.concat(listPortfolioOutput.PortfolioDetails);
      }
    } while (pageToken);

    // Find the SWB portfolio
    const portfolioName = process.env.PORTFOLIO_NAME;
    const portfolio = portfolioDetails.find((portfolio: PortfolioDetail) => {
      return portfolio.DisplayName === portfolioName;
    });

    if (portfolio === undefined) {
      throw new Error(`Could not find portfolio with name ${portfolioName}`);
    }

    return portfolio.Id!;
  }

  private async _getAccountMetadata(): Promise<
    {
      stackName: string;
      accountHandlerRoleArn: string;
      envMgmtRoleArn: string;
      externalId: string;
    }[]
  > {
    const ddbTableName = process.env.STACK_NAME!;
    const accountService = new AccountService(ddbTableName);

    const accounts = await accountService.getAccounts();

    return accounts.map((account) => {
      return {
        stackName: account.stackName,
        accountHandlerRoleArn: account.accountHandlerRoleArn,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId || ''
      };
    });
    // TODO: Update this
    // TODO: Get this data from DDB
    // return Promise.resolve({
    //   externalId: 'workbench',
    //   hostingAccounts: [
    //     {
    //       arns: {
    //         accountHandler: 'arn:aws:iam::<HOSTING_ACCOUNT>:role/swb-swbv2-va-cross-account-role',
    //         envManagement: 'arn:aws:iam::<HOSTING_ACCOUNT>:role/swb-swbv2-va-env-mgmt'
    //       },
    //       stackName: `swbv2-host`
    //     }
    //   ],
    //   portfolioId: 'port-45ssvg67eyrek'
    // });
  }
}
