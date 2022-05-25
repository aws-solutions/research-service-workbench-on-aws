/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ = require('lodash');
import { AwsService } from '@amzn/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';
import IamRoleCloneService from './iamRoleCloneService';
import AccountsService from './accountsService';
import { Readable } from 'stream';
import { ResourceNotFoundException } from '@aws-sdk/client-eventbridge';

export default class HostingAccountLifecycleService {
  private _aws: AwsService;
  private _stackName: string;
  public constructor() {
    this._stackName = process.env.STACK_NAME!;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: this._stackName });
  }

  public async initializeAccount(accountMetadata: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    const accountsService = new AccountsService();

    const cfService = this._aws.helpers.cloudformation;
    const { [process.env.STATUS_HANDLER_ARN_NAME!]: statusHandlerArn } = await cfService.getCfnOutput(
      this._stackName,
      [process.env.STATUS_HANDLER_ARN_NAME!]
    );

    // Update main account default event bus to accept hosting account state change events
    await this.updateBusPermissions(statusHandlerArn, accountMetadata.awsAccountId);

    // Finally store the new/updated account details in DDB
    return accountsService.createOrUpdate(accountMetadata);
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
    let vpcId: string | undefined;
    let subnetId: string | undefined;
    const describeCfResponse = await hostingAccountAwsService.clients.cloudformation.describeStacks({
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

  public async updateBusPermissions(statusHandlerArn: string, awsAccountId: string): Promise<void> {
    const busName = 'default';

    // TODO: Figure out how to include all accounts IDs in a single statement
    const params = {
      Action: 'events:PutEvents',
      EventBusName: busName,
      Principal: awsAccountId,
      StatementId: `Allow-main-account-to-get-${awsAccountId}-events`
    };

    // Put permission for main account to receive hosting account events
    await this._aws.clients.eventBridge.putPermission(params);

    let busRule;
    const busRuleName = 'RouteHostEvents';
    const describeRuleParams = { Name: busRuleName, EventBusName: busName };

    try {
      // Describe rule to see if it exists
      busRule = await this._aws.clients.eventBridge.describeRule(describeRuleParams);

      const putRuleParams = {
        Name: busRuleName,
        EventPattern: JSON.stringify({
          account: busRule?.EventPattern
            ? _.uniq(_.concat(JSON.parse(busRule.EventPattern).account, awsAccountId))
            : [awsAccountId],
          source: [{ 'anything-but': ['aws.config', 'aws.cloudtrail', 'aws.ssm', 'aws.tag'] }],
          'detail-type': [{ 'anything-but': 'AWS API Call via CloudTrail' }]
        }),
        EventBusName: busName
      };
      // Create/update rule for main account event bus
      await this._aws.clients.eventBridge.putRule(putRuleParams);
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        const putRuleParams = {
          Name: busRuleName,
          EventPattern: JSON.stringify({
            account: [awsAccountId],
            source: [{ 'anything-but': ['aws.config', 'aws.cloudtrail', 'aws.ssm', 'aws.tag'] }],
            'detail-type': [{ 'anything-but': 'AWS API Call via CloudTrail' }]
          }),
          EventBusName: busName
        };
        // Create rule for main account event bus
        await this._aws.clients.eventBridge.putRule(putRuleParams);
      } else {
        throw e;
      }
    }

    // Create status handler lambda policy if this is the first hosting account being set up
    await this._createStatusHandlerPerm(statusHandlerArn, busRuleName);

    const putTargetsParams = {
      EventBusName: busName,
      Rule: busRuleName,
      Targets: [{ Arn: statusHandlerArn, Id: 'RouteToStatusHandler' }]
    };

    // Create/update rule target to route events to status handler lambda
    await this._aws.clients.eventBridge.putTargets(putTargetsParams);
  }

  private async _createStatusHandlerPerm(statusHandlerArn: string, busRuleName: string): Promise<void> {
    try {
      // Describe lambda permission to see if it exists
      const getPolicyParams = {
        FunctionName: statusHandlerArn
      };
      await this._aws.clients.lambda.getPolicy(getPolicyParams);
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
  }

  public async shareAMIs(targetAccountId: string, amisToShare: string[]): Promise<void> {
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
