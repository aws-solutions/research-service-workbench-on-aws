import { AwsService } from '@amzn/workbench-core-base';
import IamRoleCloneService from './iamRoleCloneService';
import { getCfnOutput } from './cloudformationUtil';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';
import { Readable } from 'stream';
export default class AccountHandler {
  private _mainAccountAwsService: AwsService;

  public constructor(mainAccountAwsService: AwsService) {
    this._mainAccountAwsService = mainAccountAwsService;
  }
  // TODO: Consider moving these methods to `hostingAccountLifecycleService`
  // TODO: Take a look at this https://quip-amazon.com/5SbZAHDcaw0m/Account-Class-Architecture
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
     * Check if all hosting accounts have updated onboard-account.cfn.yml template. If the hosting accounts does not, update hosting account status to be Needs Update
     * Add hosting account VPC and Subnet ID to DDB. This is needed when launching environments
     */

    // eslint-disable-next-line
    const { hostingAccounts, externalId, portfolioId } = await this._getMetadataFromDB();
    const hostingAccountLifecycleService = new HostingAccountLifecycleService(
      process.env.AWS_REGION!,
      process.env.STACK_NAME!
    );
    const {
      [process.env.LAUNCH_CONSTRAINT_ROLE_NAME!]: launchConstraintRoleName,
      [process.env.S3_ARTIFACT_BUCKET_ARN_NAME!]: s3ArtifactBucketArn
    } = await getCfnOutput(this._mainAccountAwsService, process.env.STACK_NAME!, [
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

      await this._shareAndAcceptScPortfolio(
        hostingAccountAwsService,
        hostingAccountId as string,
        portfolioId as string
      );
      await this._associateIamRoleWithPortfolio(
        hostingAccountAwsService,
        hostingAccount.arns.envManagement,
        portfolioId as string
      );

      const iamRoleCloneService = new IamRoleCloneService(
        this._mainAccountAwsService,
        hostingAccountAwsService
      );
      await iamRoleCloneService.cloneRole(launchConstraintRoleName);
      await hostingAccountLifecycleService.updateAccount(hostingAccountId, process.env.SSM_DOC_NAME_SUFFIX!);
      const s3ArtifactBucketName = s3ArtifactBucketArn.split(':').pop() || '';
      await this._compareHostingAccountTemplate(
        s3ArtifactBucketName,
        hostingAccountAwsService,
        hostingAccount.stackName
      );
    }
  }

  private async _compareHostingAccountTemplate(
    s3ArtifactBucketName: string,
    hostingAccountAwsService: AwsService,
    hostingAccountStackName: string
  ): Promise<void> {
    // TODO: Check whether stack is in `UPDATE_COMPLETE` or `CREATE_COMPLETE` or `FAILED`
    // Possible final state: UP_TO_DATE, NEEDS_UPDATE, PENDING, ERRORED
    // https://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/services/cloudformation/model/StackStatus.html
    const getObjResponse = await this._mainAccountAwsService.s3.getObject({
      Bucket: s3ArtifactBucketName,
      Key: 'onboard-account.cfn.yaml'
    });
    const streamToString = (stream: Readable): Promise<string> =>
      new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });
    const expectedTemplate: string = await streamToString(getObjResponse.Body! as Readable);
    const actualTemplate = (
      await hostingAccountAwsService.cloudformation.getTemplate({ StackName: hostingAccountStackName })
    ).TemplateBody!;

    const removeCommentsAndSpaces = (template: string): string => {
      return template.replace(/#.*/g, '').replace(/\s+/g, '');
    };

    // TODO: Write result to DDB
    if (removeCommentsAndSpaces(actualTemplate) === removeCommentsAndSpaces(expectedTemplate)) {
      console.log('Same template');
    } else {
      console.log('Different template');
    }

    // Check out sample code in sampleJsCode project, file compareTemplate.js
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
      hostingAccounts: [
        {
          arns: {
            accountHandler: 'arn:aws:iam::750404249455:role/swb-dev-oh-account-1-cross-account-role',
            envManagement: 'arn:aws:iam::750404249455:role/swb-dev-oh-account-1-xacc-env-mgmt'
          },
          stackName: `swb-dev-oh-account-1`
        }
      ],
      portfolioId: 'port-4n4g66unobu34'
    });
  }
}
