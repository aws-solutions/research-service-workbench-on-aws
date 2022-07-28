/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { AwsService } from '@amzn/workbench-core-base';
import { IamHelper } from '@amzn/workbench-core-datasets';
import { PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import { Output } from '@aws-sdk/client-cloudformation';
import { ResourceNotFoundException } from '@aws-sdk/client-eventbridge';
import { GetBucketPolicyCommandOutput, PutBucketPolicyCommandInput } from '@aws-sdk/client-s3';
import _ from 'lodash';
import { HostingAccountStatus } from '../constants/hostingAccountStatus';
import AccountService from '../services/accountService';
import IamRoleCloneService from './iamRoleCloneService';

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

  /**
   * Links hosting account with main account policies for cross account communication
   * @param accountMetadata - the attributes of the given hosting account from the onboarded CFN stack outputs
   *
   * @returns account record in DDB
   */
  public async initializeAccount(accountMetadata: {
    [key: string]: string;
  }): Promise<{ [key: string]: string }> {
    const cfService = this._aws.helpers.cloudformation;
    const {
      [process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!]: statusHandlerArn,
      [process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!]: artifactBucketArn,
      [process.env.MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!]: mainAcctEncryptionArn
    } = await cfService.getCfnOutput(this._stackName, [
      process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!,
      process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!,
      process.env.MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!
    ]);

    // Update main account default event bus to accept hosting account state change events
    await this.updateBusPermissions(statusHandlerArn, accountMetadata.awsAccountId);

    // Add account to artifactBucket's bucket policy
    await this.updateArtifactsBucketPolicy(artifactBucketArn, accountMetadata.awsAccountId);

    // Update main account encryption key policy
    await this.updateMainAccountEncryptionKeyPolicy(mainAcctEncryptionArn, accountMetadata.awsAccountId);

    // Finally store the new/updated account details in DDB
    return this._accountService.createOrUpdate(accountMetadata);
  }

  /**
   * Updates main account encryption key policy to include new hosting account
   * @param mainAcctEncryptionArn - the encryption key in main account
   * @param awsAccountId - AWS Account ID of hosting account
   */
  public async updateMainAccountEncryptionKeyPolicy(
    mainAcctEncryptionArn: string,
    awsAccountId: string
  ): Promise<void> {
    const keyId = mainAcctEncryptionArn.split('/').pop()!;
    const keyPolicyResponse = await this._aws.clients.kms.getKeyPolicy({
      KeyId: keyId,
      PolicyName: 'default'
    });
    let keyPolicy = PolicyDocument.fromJson(JSON.parse(keyPolicyResponse.Policy!));

    keyPolicy = IamHelper.addPrincipalToStatement(
      keyPolicy,
      'main-key-share-statement',
      `arn:aws:iam::${awsAccountId}:root`
    );

    const putPolicyParams = {
      KeyId: keyId,
      PolicyName: 'default',
      Policy: JSON.stringify(keyPolicy.toJSON())
    };

    // Update key policy
    await this._aws.clients.kms.putKeyPolicy(putPolicyParams);
  }

  /**
   * Update artifacts bucket policy to include new hosting account ID for environment bootstrap file access
   * @param artifactBucketArn - ARN of the artifacts bucket in main account
   * @param awsAccountId - Hosting account ID to add as principal for list/get access
   */
  public async updateArtifactsBucketPolicy(artifactBucketArn: string, awsAccountId: string): Promise<void> {
    const bucketName = artifactBucketArn.split(':').pop() as string;

    let bucketPolicy: PolicyDocument = new PolicyDocument();
    try {
      const bucketPolicyResponse: GetBucketPolicyCommandOutput = await this._aws.clients.s3.getBucketPolicy({
        Bucket: bucketName
      });
      bucketPolicy = PolicyDocument.fromJson(JSON.parse(bucketPolicyResponse.Policy!));
    } catch (e) {
      // All errors should be thrown except "NoSuchBucketPolicy" error. For "NoSuchBucketPolicy" error we assign new bucket policy for bucket
      if (e.Code !== 'NoSuchBucketPolicy') {
        throw e;
      }
    }

    // If List statement doesn't exist, create one
    if (!IamHelper.containsStatementId(bucketPolicy, 'List:environment-files')) {
      const listStatement = PolicyStatement.fromJson(
        JSON.parse(`
       {
        "Sid": "List:environment-files",
        "Effect": "Allow",
        "Principal": {
          "AWS":"arn:aws:iam::${awsAccountId}:root"
        },
        "Action": "s3:ListBucket",
        "Resource": ["${artifactBucketArn}"],
        "Condition": {
          "StringLike": {
            "s3:prefix": "environment-files*"
            }
          }
        }`)
      );
      bucketPolicy.addStatements(listStatement);
    } else {
      // If List statement doesn't contain this accountId, add it
      bucketPolicy = IamHelper.addPrincipalToStatement(
        bucketPolicy,
        'List:environment-files',
        `arn:aws:iam::${awsAccountId}:root`
      );
    }

    // If Get statement doesn't exist, create one
    if (!IamHelper.containsStatementId(bucketPolicy, 'Get:environment-files')) {
      const getStatement = PolicyStatement.fromJson(
        JSON.parse(`
       {
        "Sid": "Get:environment-files",
        "Effect": "Allow",
        "Principal": {
          "AWS":"arn:aws:iam::${awsAccountId}:root"
        },
        "Action": "s3:GetObject",
        "Resource": ["${artifactBucketArn}/environment-files*"]
        }`)
      );
      bucketPolicy.addStatements(getStatement);
    } else {
      // If Get statement doesn't contain this accountId, add it
      bucketPolicy = IamHelper.addPrincipalToStatement(
        bucketPolicy,
        'Get:environment-files',
        `arn:aws:iam::${awsAccountId}:root`
      );
    }

    const putPolicyParams: PutBucketPolicyCommandInput = {
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy.toJSON())
    };

    // Update bucket policy
    await this._aws.clients.s3.putBucketPolicy(putPolicyParams);
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
   * s3ArtifactBucketName - S3 bucket that contains CFN Template for hosting account
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

  /**
   * Store hosting account status, vpcId, and subnetId into DDB
   * @param ddbAccountId - id of DDB item with resourceType = 'account'
   * @param s3ArtifactBucketName - S3 bucket that contains CFN Template for hosting account
   * @param hostingAccountAwsService - AWS Service for hosting account
   * @param hostingAccountStackName - Hosting account stack name
   */
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

    if (['CREATE_COMPLETE', 'UPDATE_COMPLETE'].includes(describeStackResponse.Stacks![0]!.StackStatus!)) {
      const outputs: Output[] = describeStackResponse.Stacks![0]!.Outputs as Output[];
      const vpcId = outputs.find((output) => {
        return output.OutputKey === 'VPC';
      })!.OutputValue;
      const subnetId = outputs.find((output) => {
        return output.OutputKey === 'VpcSubnet';
      })!.OutputValue;
      const encryptionKeyArn = outputs.find((output) => {
        return output.OutputKey === 'EncryptionKeyArn';
      })!.OutputValue;

      if (removeCommentsAndSpaces(actualTemplate) === removeCommentsAndSpaces(expectedTemplate)) {
        await this._writeAccountStatusToDDB({
          ddbAccountId,
          status: 'CURRENT',
          vpcId,
          subnetId,
          encryptionKeyArn
        });
      } else {
        await this._writeAccountStatusToDDB({
          ddbAccountId,
          status: 'NEEDS_UPDATE',
          vpcId,
          subnetId,
          encryptionKeyArn
        });
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
    encryptionKeyArn?: string;
  }): Promise<void> {
    const updateParam: {
      id: string;
      status: string;
      vpcId?: string;
      subnetId?: string;
      encryptionKeyArn?: string;
    } = {
      id: param.ddbAccountId,
      status: param.status
    };
    if (param.vpcId) {
      updateParam.vpcId = param.vpcId;
    }
    if (param.subnetId) {
      updateParam.subnetId = param.subnetId;
    }
    if (param.encryptionKeyArn) {
      updateParam.encryptionKeyArn = param.encryptionKeyArn;
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
  /** Update main account default event bus to accept hosting account state change events
   ** Also update its rule to add the new hosting account ID if it wasn't already present
   * @param statusHandlerArn - The ARN of StatusHandler lambda which becomes the target of the default bus rule
   * @param awsAccountId - The hosting account ID that needs to have permission to put events to the main default bus
   */
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

    const putTargetsParams = {
      EventBusName: busName,
      Rule: busRuleName,
      Targets: [{ Arn: statusHandlerArn, Id: 'RouteToStatusHandler' }]
    };

    // Create/update rule target to route events to status handler lambda
    await this._aws.clients.eventBridge.putTargets(putTargetsParams);
  }

  private async _shareAMIs(targetAccountId: string, amisToShare: string[]): Promise<void> {
    console.log(`Sharing AMIs: [${amisToShare}] with account ${targetAccountId}`);
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
    console.log(`Sharing SSM documents: [${ssmDocuments}]`);
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
