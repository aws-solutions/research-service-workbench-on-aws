/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ = require('lodash');
import { AwsService } from '@amzn/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';
import IamRoleCloneService from './iamRoleCloneService';
import AccountService from './accountService';
import { Readable } from 'stream';
import { ResourceNotFoundException } from '@aws-sdk/client-eventbridge';
import { HostingAccountStatus } from './hostingAccountStatus';

export default class HostingAccountLifecycleService {
  private _aws: AwsService;
  private _stackName: string;
  private _accountService: AccountService;
  public constructor() {
    this._stackName = process.env.STACK_NAME!;
    const ddbTableName = process.env.STACK_NAME!; // The DDB table has the same name as the stackName
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName });
    this._accountService = new AccountService(ddbTableName);
  }

  public async initializeAccount(accountMetadata: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    const cfService = this._aws.helpers.cloudformation;
    const {
      [process.env.MAIN_ACCOUNT_BUS_ARN_NAME!]: mainAccountBusArn,
      [process.env.STATUS_HANDLER_ARN_NAME!]: statusHandlerArn
    } = await cfService.getCfnOutput(this._stackName, [
      process.env.MAIN_ACCOUNT_BUS_ARN_NAME!,
      process.env.STATUS_HANDLER_ARN_NAME!
    ]);

    // // Update main account event bus to accept hosting account events
    await this.updateEventBridgePermissions(
      mainAccountBusArn,
      statusHandlerArn,
      accountMetadata.awsAccountId
    );

    // Finally store the new/updated account details in DDB
    let accountDetails;
    if (_.isUndefined(accountMetadata.id)) {
      accountDetails = await this._accountService.create({ ...accountMetadata, status: 'PENDING' });
    } else {
      accountDetails = await this._accountService.update(accountMetadata);
    }

    return accountDetails;
  }

  /**
   * Update target account with resources required for launching environments in the account
   * @param params - Listed below
   * ddbAccountId - id of DDB item with resourceType = 'account'
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
    ddbAccountId: string;
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
      ddbAccountId,
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
    await this._shareAMIs(targetAccountId, JSON.parse(process.env.AMI_IDS_TO_SHARE!));
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
      ddbAccountId,
      s3ArtifactBucketName,
      targetAccountAwsService,
      targetAccountStackName
    );
  }

  private async _updateHostingAccountStatus(
    ddbAccountId: string,
    s3ArtifactBucketName: string,
    hostingAccountAwsService: AwsService,
    hostingAccountStackName: string
  ): Promise<void> {
    console.log('Check and update hosting account status');
    // Check if hosting account stack has the latest CFN template
    const getObjResponse = await this._aws.clients.s3.getObject({
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
      await hostingAccountAwsService.clients.cloudformation.getTemplate({
        StackName: hostingAccountStackName
      })
    ).TemplateBody!;

    const removeCommentsAndSpaces = (template: string): string => {
      return template.replace(/#.*/g, '').replace(/\s+/g, '');
    };

    const describeStackResponse = await hostingAccountAwsService.clients.cloudformation.describeStacks({
      StackName: hostingAccountStackName
    });
    const describeCfResponse = await hostingAccountAwsService.clients.cloudformation.describeStacks({
      StackName: hostingAccountStackName
    });
    if (['CREATE_COMPLETE', 'UPDATE_COMPLETE'].includes(describeCfResponse.Stacks![0]!.StackStatus!)) {
      const outputs: Output[] = describeCfResponse.Stacks![0]!.Outputs as Output[];
      const vpcId = outputs.find((output) => {
        return output.OutputKey === 'VPC';
      })!.OutputValue;
      const subnetId = outputs.find((output) => {
        return output.OutputKey === 'VpcSubnet';
      })!.OutputValue;

      if (removeCommentsAndSpaces(actualTemplate) === removeCommentsAndSpaces(expectedTemplate)) {
        await this._writeAccountStatusToDDB({ ddbAccountId, status: 'CURRENT', vpcId, subnetId });
      } else {
        await this._writeAccountStatusToDDB({ ddbAccountId, status: 'NEEDS_UPDATE', vpcId, subnetId });
      }
    } else if (describeStackResponse.Stacks![0]!.StackStatus! === 'FAILED') {
      await this._writeAccountStatusToDDB({ ddbAccountId, status: 'ERRORED' });
    }
  }

  private async _writeAccountStatusToDDB(param: {
    ddbAccountId: string;
    status: HostingAccountStatus;
    vpcId?: string;
    subnetId?: string;
  }): Promise<void> {
    const updateParam: { id: string; status: string; vpcId?: string; subnetId?: string } = {
      id: param.ddbAccountId,
      status: param.status
    };
    if (param.vpcId) {
      updateParam.vpcId = param.vpcId;
    }
    if (param.subnetId) {
      updateParam.subnetId = param.subnetId;
    }
    console.log('_writeAccountStatusToDDB param', param);
    await this._accountService.update(updateParam);
  }

  private async _shareAndAcceptScPortfolio(
    hostingAccountAwsService: AwsService,
    hostingAccountId: string,
    portfolioId: string
  ): Promise<void> {
    console.log(`Sharing Service Catalog Portfolio ${portfolioId} with account ${hostingAccountId} `);
    await this._aws.clients.serviceCatalog.createPortfolioShare({
      PortfolioId: portfolioId,
      AccountId: hostingAccountId
    });

    await hostingAccountAwsService.clients.serviceCatalog.acceptPortfolioShare({ PortfolioId: portfolioId });
  }

  private async _associatePrincipalIamRoleWithPortfolio(
    hostingAccountAwsService: AwsService,
    iamRole: string,
    portfolioId: string
  ): Promise<void> {
    console.log(`Associating ${iamRole} with porfolio ${portfolioId}`);
    await hostingAccountAwsService.clients.serviceCatalog.associatePrincipalWithPortfolio({
      PortfolioId: portfolioId,
      PrincipalARN: iamRole,
      PrincipalType: 'IAM'
    });
  }

  public async updateEventBridgePermissions(
    mainAccountBusArn: string,
    statusHandlerArn: string,
    awsAccountId: string
  ): Promise<void> {
    const mainAccountBusName = mainAccountBusArn.split('/')[1];
    const params = {
      Action: 'events:PutEvents',
      EventBusName: mainAccountBusName,
      Principal: awsAccountId,
      StatementId: `Allow-main-account-to-get-${awsAccountId}-events`
    };

    // Put permission for main account to receive hosting account events
    await this._aws.clients.eventBridge.putPermission(params);

    let busRule;
    const busRuleName = 'RouteHostEvents';
    const describeRuleParams = { Name: busRuleName, EventBusName: mainAccountBusName };

    try {
      // Describe rule to see if it exists
      busRule = await this._aws.clients.eventBridge.describeRule(describeRuleParams);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        console.log(
          'Onboarding first hosting account for the main event bus. Setting up status handler lambda permissions.'
        );

        const addPermissionParams = {
          StatementId: `AWSEvents_${busRuleName}`,
          Action: 'lambda:InvokeFunction',
          FunctionName: statusHandlerArn,
          Principal: 'events.amazonaws.com'
        };

        // Add permissions on status handler lambda to get events from eventbridge
        await this._aws.clients.lambda.addPermission(addPermissionParams);
      } else {
        throw e;
      }
    }

    const putRuleParams = {
      Name: busRuleName,
      EventPattern: JSON.stringify({
        account: busRule?.EventPattern
          ? _.uniq(_.concat(JSON.parse(busRule.EventPattern).account, awsAccountId))
          : [awsAccountId],
        // Filter out CloudTrail noise
        'detail-type': [{ 'anything-but': 'AWS API Call via CloudTrail' }]
      }),
      EventBusName: mainAccountBusName
    };

    // Create/update rule for main account event bus
    await this._aws.clients.eventBridge.putRule(putRuleParams);

    const putTargetsParams = {
      EventBusName: mainAccountBusName,
      Rule: busRuleName,
      Targets: [{ Arn: statusHandlerArn, Id: 'RouteToStatusHandler' }]
    };

    // Create/update rule target to route events to status handler lambda
    await this._aws.clients.eventBridge.putTargets(putTargetsParams);
  }

  private async _shareAMIs(targetAccountId: string, amisToShare: string[]): Promise<void> {
    if (amisToShare && amisToShare.length > 0) {
      for (const amiId of amisToShare) {
        const params = {
          ImageId: amiId,
          Attribute: 'LaunchPermission',
          LaunchPermission: { Add: [{ UserId: targetAccountId }] }
        };
        await this._aws.clients.ec2.modifyImageAttribute(params);
      }
    }
  }

  /*
   * Make an API call to SSM in the main account to share SSM documents for launch/terminate with the hosting account.
   */
  private async _shareSSMDocument(ssmDocuments: string[], accountId: string): Promise<void> {
    for (const ssmDoc of ssmDocuments) {
      const params = { Name: ssmDoc, PermissionType: 'Share', AccountIdsToAdd: [accountId] };
      await this._aws.clients.ssm.modifyDocumentPermission(params);
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

    const stackDetails = await this._aws.clients.cloudformation.describeStacks(describeStackParam);

    const ssmDocOutputs = stackDetails.Stacks![0].Outputs!.filter((output: Output) => {
      return output.OutputKey && output.OutputKey.endsWith(ssmDocNameSuffix);
    });

    return ssmDocOutputs.map((output: Output) => {
      return this._getNameFromArn({ output, outputName: output.OutputKey });
    });
  }
}
