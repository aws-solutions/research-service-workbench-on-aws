import { AwsService, CloudformationService } from '@amzn/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';
import IamRoleCloneService from './iamRoleCloneService';
import { Readable } from 'stream';

export default class HostingAccountLifecycleService {
  private _aws: AwsService;
  private _stackName: string;
  public constructor(awsRegion: string, stackName: string) {
    this._aws = new AwsService({ region: awsRegion });
    this._stackName = stackName;
  }

  public async initializeAccount(
    accountMetadata: {
      accountId: string;
      envManagementRoleArn: string;
      accountHandlerRoleArn: string;
    },
    mainAccountBusArnName: string
  ): Promise<void> {
    const cfService = new CloudformationService(this._aws.cloudformation);
    const { [mainAccountBusArnName]: mainAccountBusName } = await cfService.getCfnOutput(this._stackName, [
      mainAccountBusArnName
    ]);
    await this.updateEventBridgePermissions(mainAccountBusName, accountMetadata.accountId);
    await this.storeToDdb(accountMetadata);
  }

  /**
   * Update target account with resources required for launching environments in the account
   * @param params - Listed below
   * targetAccountId - Account where resources should be set up.
   * targetAccountAwsService - awsService used for setting up the account.
   * targetAccountStackName - StackName of Cloudformation Stack used to set up account's base resources.
   * portfolioId - Service Catalog portfolio that main account should share with target account.
   * ssmDocNameSuffix - Suffix of SSM docs that should be shared with target account.
   * principalArnForScPortfolio - Arn that should be associated with Service Catalog portfolio.
   * roleToCopyToTargetAccount - IAM role that should be copied from main account to target account.
   * s3ArtifactBucketName - S3 bucket that contains CFN Template for target account.
   */
  public async updateAccount(params: {
    targetAccountId: string;
    targetAccountAwsService: AwsService;
    targetAccountStackName: string;
    portfolioId: string;
    ssmDocNameSuffix: string;
    principalArnForScPortfolio: string;
    roleToCopyToTargetAccount: string;
    s3ArtifactBucketName: string;
  }): Promise<void> {
    console.log('Updating account');
    const {
      targetAccountId,
      targetAccountAwsService,
      targetAccountStackName,
      portfolioId,
      ssmDocNameSuffix,
      principalArnForScPortfolio,
      roleToCopyToTargetAccount,
      s3ArtifactBucketName
    } = params;
    const ssmDocuments = await this._getSSMDocuments(this._stackName, ssmDocNameSuffix);
    await this._shareSSMDocument(ssmDocuments, targetAccountId);
    await this.shareAMIs(targetAccountId, JSON.parse(process.env.AMI_IDS_TO_SHARE!));
    await this._shareAndAcceptScPortfolio(
      targetAccountAwsService,
      targetAccountId as string,
      portfolioId as string
    );

    await this._associatePrincipalIamRoleWithPortfolio(
      targetAccountAwsService,
      principalArnForScPortfolio,
      portfolioId as string
    );

    const iamRoleCloneService = new IamRoleCloneService(this._aws, targetAccountAwsService);
    await iamRoleCloneService.cloneRole(roleToCopyToTargetAccount);

    await this._updateHostingAccountStatus(
      s3ArtifactBucketName,
      targetAccountAwsService,
      targetAccountStackName
    );
  }

  private async _updateHostingAccountStatus(
    s3ArtifactBucketName: string,
    hostingAccountAwsService: AwsService,
    hostingAccountStackName: string
  ): Promise<void> {
    console.log('Check and update hosting account status');
    // Check if hosting account stack has the latest CFN template
    const getObjResponse = await this._aws.s3.getObject({
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

    const describeStackResponse = await hostingAccountAwsService.cloudformation.describeStacks({
      StackName: hostingAccountStackName
    });
    let vpcId: string | undefined;
    let subnetId: string | undefined;
    const describeCfResponse = await hostingAccountAwsService.cloudformation.describeStacks({
      StackName: hostingAccountStackName
    });
    if (['CREATE_COMPLETE', 'UPDATE_COMPLETE'].includes(describeCfResponse.Stacks![0]!.StackStatus!)) {
      const outputs: Output[] = describeCfResponse.Stacks![0]!.Outputs as Output[];
      vpcId = outputs.find((output) => {
        return output.OutputKey === 'VPC';
      })!.OutputValue;
      subnetId = outputs.find((output) => {
        return output.OutputKey === 'VpcSubnet';
      })!.OutputValue;

      if (removeCommentsAndSpaces(actualTemplate) === removeCommentsAndSpaces(expectedTemplate)) {
        await this._writeAccountStatusToDDB({ status: 'UP_TO_DATE', vpcId, subnetId });
      } else {
        await this._writeAccountStatusToDDB({ status: 'NEEDS_UPDATE', vpcId, subnetId });
      }
    } else if (describeStackResponse.Stacks![0]!.StackStatus! === 'FAILED') {
      await this._writeAccountStatusToDDB({ status: 'ERRORED', vpcId, subnetId });
    }
  }

  private async _writeAccountStatusToDDB(param: {
    status: 'UP_TO_DATE' | 'NEEDS_UPDATE' | 'ERRORED';
    vpcId: string | undefined;
    subnetId: string | undefined;
  }): Promise<void> {
    console.log('_writeAccountStatusToDDB param', param);
    // TODO: Write above values to DDB. If vpcId or subnetId is undefined, don't write those 2 values to DDB
  }

  private async _shareAndAcceptScPortfolio(
    hostingAccountAwsService: AwsService,
    hostingAccountId: string,
    portfolioId: string
  ): Promise<void> {
    console.log(`Sharing Service Catalog Portfolio ${portfolioId} with account ${hostingAccountId} `);
    await this._aws.serviceCatalog.createPortfolioShare({
      PortfolioId: portfolioId,
      AccountId: hostingAccountId
    });

    await hostingAccountAwsService.serviceCatalog.acceptPortfolioShare({ PortfolioId: portfolioId });
  }

  private async _associatePrincipalIamRoleWithPortfolio(
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

  public async updateEventBridgePermissions(mainAccountBusName: string, accountId: string): Promise<void> {
    const params = {
      Action: 'events:PutEvents',
      EventBusName: mainAccountBusName,
      Principal: accountId,
      StatementId: 'Allow-main-account-to-receive-host-account-events'
    };
    await this._aws.eventBridge.putPermission(params);
  }

  public async shareAMIs(targetAccountId: string, amisToShare: string[]): Promise<void> {
    if (amisToShare && amisToShare.length > 0) {
      for (const amiId of amisToShare) {
        const params = {
          ImageId: amiId,
          Attribute: 'LaunchPermission',
          LaunchPermission: { Add: [{ UserId: targetAccountId }] }
        };
        await this._aws.ec2.modifyImageAttribute(params);
      }
    }
  }

  /*
   * Make an API call to SSM in the main account to share SSM documents for launch/terminate with the hosting account.
   */
  private async _shareSSMDocument(ssmDocuments: string[], accountId: string): Promise<void> {
    for (const ssmDoc of ssmDocuments) {
      const params = { Name: ssmDoc, PermissionType: 'Share', AccountIdsToAdd: [accountId] };
      await this._aws.ssm.modifyDocumentPermission(params);
    }
  }

  private _getNameFromArn(params: { output?: Output; outputName?: string }): string {
    let currOutputVal;
    if (params.output && params.output.OutputValue) {
      const arn = params.output.OutputValue;
      const resourceName = arn.split('/').pop();
      if (resourceName) {
        currOutputVal = resourceName;
      } else {
        throw new Error(`Cannot get name from arn ${arn}`);
      }
    } else {
      throw new Error(`Cannot find output name: ${params.outputName}`);
    }
    return currOutputVal;
  }

  private async _getSSMDocuments(stackName: string, ssmDocNameSuffix: string): Promise<string[]> {
    const describeStackParam = {
      StackName: stackName
    };

    const stackDetails = await this._aws.cloudformation.describeStacks(describeStackParam);

    const ssmDocOutputs = stackDetails.Stacks![0].Outputs!.filter((output: Output) => {
      return output.OutputKey && output.OutputKey.endsWith(ssmDocNameSuffix);
    });

    return ssmDocOutputs.map((output: Output) => {
      return this._getNameFromArn({ output, outputName: output.OutputKey });
    });
  }

  /*
   * Store hosting account information in DDB
   */
  public async storeToDdb(accountMetadata: {
    accountId: string;
    envManagementRoleArn: string;
    accountHandlerRoleArn: string;
  }): Promise<void> {
    // TODO: Add DDB calls here once access patterns are established in @amzn/workbench-core-base
    // Don't forget to store the external ID used during onboarding
    return Promise.resolve();
  }
}
