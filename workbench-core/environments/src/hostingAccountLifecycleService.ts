import { AwsService } from '@amzn/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';

export default class HostingAccountLifecycleService {
  public aws: AwsService;
  public options: {
    AWS_REGION: string;
    STACK_NAME: string;
    SSM_DOC_NAME_SUFFIX: string;
    MAIN_ACCOUNT_BUS_ARN_NAME: string;
    AMI_IDS_TO_SHARE: string;
  };
  public constructor(constants: {
    AWS_REGION: string;
    STACK_NAME: string;
    SSM_DOC_NAME_SUFFIX: string;
    MAIN_ACCOUNT_BUS_ARN_NAME: string;
    AMI_IDS_TO_SHARE: string;
  }) {
    this.options = constants;
    this.aws = new AwsService({ region: this.options.AWS_REGION });
  }

  public async initializeAccount(accountMetadata: {
    accountId: string;
    envManagementRoleArn: string;
    accountHandlerRoleArn: string;
  }): Promise<void> {
    const cfnOutputs = await this.getCfnOutputs();
    await this.shareSSMDocument(cfnOutputs.ssmDocuments, accountMetadata.accountId);
    await this.shareAMIs(accountMetadata.accountId);
    await this.updateEventBridgePermissions(cfnOutputs.mainAccountBusName, accountMetadata.accountId);
    await this.storeToDdb(accountMetadata);
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

  public async shareAMIs(accountId: string): Promise<void> {
    const amisToShare: string[] = JSON.parse(this.options.AMI_IDS_TO_SHARE);
    if (amisToShare && amisToShare.length > 0) {
      for (const amiId of amisToShare) {
        const params = {
          ImageId: amiId,
          Attribute: 'LaunchPermission',
          LaunchPermission: { Add: [{ UserId: accountId }] }
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

  public async getCfnOutputs(): Promise<{
    ssmDocuments: string[];
    mainAccountBusName: string;
  }> {
    const describeStackParam = {
      StackName: this.options.STACK_NAME
    };

    const stackDetails = await this.aws.cloudformation.describeStacks(describeStackParam);

    const getNameFromArn = (params: { output?: Output; outputName?: string }): string => {
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
    };

    const eventBusArnOutput = stackDetails.Stacks![0].Outputs!.find((output: Output) => {
      return output.OutputKey && output.OutputKey === this.options.MAIN_ACCOUNT_BUS_ARN_NAME;
    });
    const mainAccountBusName = getNameFromArn({
      output: eventBusArnOutput,
      outputName: this.options.MAIN_ACCOUNT_BUS_ARN_NAME
    });

    const ssmDocOutputs = stackDetails.Stacks![0].Outputs!.filter((output: Output) => {
      return output.OutputKey && output.OutputKey.endsWith(this.options.SSM_DOC_NAME_SUFFIX);
    });

    const ssmDocuments = ssmDocOutputs.map((output: Output) => {
      return getNameFromArn({ output, outputName: output.OutputKey });
    });

    return { ssmDocuments, mainAccountBusName };
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
    return Promise.resolve();
  }
}
