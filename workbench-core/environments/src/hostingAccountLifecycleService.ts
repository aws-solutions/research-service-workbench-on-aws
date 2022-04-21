import { AwsService } from '@amzn/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';
import { getCfnOutput } from './cloudformationUtil';

export default class HostingAccountLifecycleService {
  public aws: AwsService;
  private _stackName: string;
  public constructor(awsRegion: string, stackName: string) {
    this.aws = new AwsService({ region: awsRegion });
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
    const { [mainAccountBusArnName]: mainAccountBusName } = await getCfnOutput(this.aws, this._stackName, [
      mainAccountBusArnName
    ]);
    await this.updateEventBridgePermissions(mainAccountBusName, accountMetadata.accountId);
    await this.storeToDdb(accountMetadata);
  }

  public async updateAccount(targetAccountId: string, ssmDocNameSuffix: string): Promise<void> {
    console.log('Sharing SSM Document and AMIs');
    const ssmDocuments = await this.getSSMDocuments(this._stackName, ssmDocNameSuffix);
    await this.shareSSMDocument(ssmDocuments, targetAccountId);
    await this.shareAMIs(targetAccountId, JSON.parse(process.env.AMI_IDS_TO_SHARE!));
  }

  public async updateEventBridgePermissions(mainAccountBusName: string, accountId: string): Promise<void> {
    const params = {
      Action: 'events:PutEvents',
      EventBusName: mainAccountBusName,
      Principal: accountId,
      StatementId: 'Allow-main-account-to-receive-host-account-events'
    };
    await this.aws.eventBridge.putPermission(params);
  }

  public async shareAMIs(targetAccountId: string, amisToShare: string[]): Promise<void> {
    if (amisToShare && amisToShare.length > 0) {
      for (const amiId of amisToShare) {
        const params = {
          ImageId: amiId,
          Attribute: 'LaunchPermission',
          LaunchPermission: { Add: [{ UserId: targetAccountId }] }
        };
        await this.aws.ec2.modifyImageAttribute(params);
      }
    }
  }

  /*
   * Make an API call to SSM in the main account to share SSM documents for launch/terminate with the hosting account.
   */
  public async shareSSMDocument(ssmDocuments: string[], accountId: string): Promise<void> {
    for (const ssmDoc of ssmDocuments) {
      const params = { Name: ssmDoc, PermissionType: 'Share', AccountIdsToAdd: [accountId] };
      await this.aws.ssm.modifyDocumentPermission(params);
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

  public async getSSMDocuments(stackName: string, ssmDocNameSuffix: string): Promise<string[]> {
    const describeStackParam = {
      StackName: stackName
    };

    const stackDetails = await this.aws.cloudformation.describeStacks(describeStackParam);

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
