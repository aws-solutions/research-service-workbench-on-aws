import { AwsService, CloudformationService } from '@amzn/workbench-core-base';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';
export default class AccountHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  // TODO: Write unit tests
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
  public async execute(event: any): Promise<void> {
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
            accountHandler: 'arn:aws:iam::0123456789012:role/swb-dev-oh-account-1-cross-account-role',
            envManagement: 'arn:aws:iam::0123456789012:role/swb-dev-oh-account-1-env-mgmt'
          },
          stackName: `swb-dev-oh-account-1`
        }
      ],
      portfolioId: 'port-4n4g66unobu34'
    });
  }
}
