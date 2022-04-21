/* eslint-disable */
import { AwsService, CloudformationService } from '@amzn/workbench-core-base';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';
import IamRoleCloneService from './iamRoleCloneService';
export default class AccountHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  // TODO: Write unit tests
  /* eslint-disable-next-line */
  public async execute(event: any): Promise<void> {
    /*
     * [Done] Share SC portfolio with hosting accounts that doesn't already have SC portfolio from main account
     * [Done] Hosting account accept portfolio (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/accept-portfolio-share.html) that was shared
     * [Done] In hosting account, associate envManagement IAM role to SC portfolio (API (https://docs.aws.amazon.com/cli/latest/reference/servicecatalog/associate-principal-with-portfolio.html))(Example code (https://github.com/awslabs/service-workbench-on-aws/blob/5afa5a68ac8fdb4939864e52a5b13cfc0b227118/addons/addon-environment-sc-api/packages/environment-sc-workflow-steps/lib/steps/share-portfolio-with-target-acc/share-portfolio-with-target-acc.js#L84) from SWBv1)
     * [Done] Copy LaunchConstraint role to hosting accounts that doesn't already have the role
     * [Done] Share SSM documents with all hosting accounts that does not have the SSM document already
     * [Done] Share all AMIs in this https://quip-amazon.com/HOa9A1K99csF/Environment-Management-Design#temp:C:HDIfa98490bd9047f0d9bfd43ee0 with all hosting account
     * [Done] Check if all hosting accounts have updated onboard-account.cfn.yml template. If the hosting accounts does not, update hosting account status to be Needs Update
     * [Done] Add hosting account VPC and Subnet ID to DDB. This is needed when launching environments
     */

    // eslint-disable-next-line
    const { hostingAccounts, externalId, portfolioId } = await this._getMetadataFromDB();
    const hostingAccountLifecycleService = new HostingAccountLifecycleService(
      process.env.AWS_REGION!,
      process.env.STACK_NAME!
    );

    const cfService = new CloudformationService(this._mainAccountAwsService.cloudformation);
    const {
      [process.env.LAUNCH_CONSTRAINT_ROLE_NAME!]: launchConstraintRoleName,
      [process.env.S3_ARTIFACT_BUCKET_ARN_NAME!]: s3ArtifactBucketArn
    } = await cfService.getCfnOutput(process.env.STACK_NAME!, [
      process.env.LAUNCH_CONSTRAINT_ROLE_NAME!,
      process.env.S3_ARTIFACT_BUCKET_ARN_NAME!
    ]);
    for (const hostingAccount of hostingAccounts) {
      const hostingAccountId = this._getAccountId(hostingAccount.arns.accountHandler);
      let hostingAccountAwsService: AwsService;
      try {
        hostingAccountAwsService = await this._mainAccountAwsService.getAwsServiceForRole({
          roleArn: hostingAccount.arns.accountHandler,
          roleSessionName: 'account-handler',
          externalId: externalId as string,
          region: process.env.AWS_REGION!
        });
      } catch (e) {
        console.log(
          `Cannot assume role ${hostingAccount.arns.accountHandler} for hosting account. Skipping setup for this account`
        );
        continue;
      }

      const s3ArtifactBucketName = s3ArtifactBucketArn.split(':').pop() || '';
      await hostingAccountLifecycleService.updateAccount(
        hostingAccountId,
        hostingAccountAwsService,
        hostingAccount.stackName,
        portfolioId,
        process.env.SSM_DOC_NAME_SUFFIX!,
        hostingAccount.arns.envManagement,
        launchConstraintRoleName,
        s3ArtifactBucketName
      );
    }
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
      hostingAccounts: [
        {
          arns: {
            accountHandler: 'arn:aws:iam::750404249455:role/swb-dev-oh-account-1-cross-account-role',
            envManagement: 'arn:aws:iam::750404249455:role/swb-dev-oh-account-1-env-mgmt'
          },
          stackName: `swb-dev-oh-account-1`
        }
      ],
      portfolioId: 'port-4n4g66unobu34'
    });
  }
}
