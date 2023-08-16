/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import {
  addPaginationToken,
  AwsService,
  DEFAULT_API_PAGE_SIZE,
  IamRoleCloneService,
  PaginatedResponse
} from '@aws/workbench-core-base';
import { IamHelper } from '@aws/workbench-core-datasets';
import { Output } from '@aws-sdk/client-cloudformation';
import { ResourceNotFoundException } from '@aws-sdk/client-eventbridge';
import {
  GetBucketPolicyCommandOutput,
  PutBucketPolicyCommandInput,
  NoSuchBucket,
  S3ServiceException
} from '@aws-sdk/client-s3';
import * as Boom from '@hapi/boom';
import { PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import _ from 'lodash';
import { HostingAccountStatus } from '../constants/hostingAccountStatus';
import { InvalidAwsAccountIdError } from '../errors/InvalidAwsAccountIdError';
import { AccountCfnTemplateParameters, TemplateResponse } from '../models/accountCfnTemplate';
import { Account } from '../models/accounts/account';
import { AwsAccountTemplateUrlsRequest } from '../models/accounts/awsAccountTemplateUrlsRequest';
import { CreateAccountRequest } from '../models/accounts/createAccountRequest';
import { GetAccountRequest } from '../models/accounts/getAccountRequest';
import { ListAccountRequest } from '../models/accounts/listAccountsRequest';
import { UpdateAccountRequest } from '../models/accounts/updateAccountRequest';
import AccountService from '../services/accountService';

interface Arns {
  statusHandlerArn: string;
  artifactBucketArn: string;
  mainAcctEncryptionArnList: string[];
}

export default class HostingAccountLifecycleService {
  private _aws: AwsService;
  private _stackName: string;
  private _accountService: AccountService;
  public constructor(stackName: string, awsService: AwsService, accountService: AccountService) {
    this._stackName = stackName;
    this._aws = awsService;
    this._accountService = accountService;
  }

  public async listAccounts(listAccountRequest: ListAccountRequest): Promise<PaginatedResponse<Account>> {
    const queryParams = addPaginationToken(listAccountRequest.paginationToken, {
      index: 'getResourceByName',
      key: { name: 'resourceType', value: 'account' },
      limit: listAccountRequest.pageSize || DEFAULT_API_PAGE_SIZE
    });

    return this._accountService.getPaginatedAccounts(queryParams);
  }

  public getAccount(request: GetAccountRequest, includeMetadata: boolean): Promise<Account> {
    return this._accountService.getAccount(request.id, includeMetadata);
  }

  /**
   * Create/Upload template and return its URL
   *
   * @param request - AwsAccountTemplateUrlsRequest
   *
   * @returns A URL to a prepopulated template for onboarding the hosting account.
   */
  public async buildTemplateUrlsForAccount(
    request: AwsAccountTemplateUrlsRequest
  ): Promise<Record<string, TemplateResponse>> {
    // Share the artifacts bucket with the new hosting account
    const {
      [process.env.ACCT_HANDLER_ARN_OUTPUT_KEY!]: accountHandlerRoleArn,
      [process.env.STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY!]: statusHandlerRoleArn,
      [process.env.API_HANDLER_ARN_OUTPUT_KEY!]: apiHandlerRoleArn,
      [process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!]: artifactBucketArn
    } = await this._aws.helpers.cloudformation.getCfnOutput(this._stackName, [
      process.env.ACCT_HANDLER_ARN_OUTPUT_KEY!,
      process.env.STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY!,
      process.env.API_HANDLER_ARN_OUTPUT_KEY!,
      process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!
    ]);

    const templateParameters: AccountCfnTemplateParameters = {
      accountHandlerRole: accountHandlerRoleArn,
      apiHandlerRole: apiHandlerRoleArn,
      enableFlowLogs: 'true',
      externalId: request.externalId,
      launchConstraintPolicyPrefix: '*', // We can do better, get from stack outputs?
      launchConstraintRolePrefix: '*', // We can do better, get from stack outputs?
      mainAccountId: process.env.MAIN_ACCT_ID!,
      namespace: process.env.STACK_NAME!,
      stackName: process.env.STACK_NAME!.concat('-hosting-account'),
      statusHandlerRole: statusHandlerRoleArn
    };

    const parsedBucketArn = artifactBucketArn.replace('arn:aws:s3:::', '').split('/');
    const bucket = parsedBucketArn[0];
    const templateTypes = ['', '-byon'];
    const updateUrls = {};
    await Promise.all(
      templateTypes.map(async (t): Promise<void> => {
        const fileName = `onboard-account${t}`;
        const signedUrl = await this._aws.helpers.s3.getPresignedUrl(bucket, `${fileName}.cfn.yaml`, 15 * 60);
        _.set(updateUrls, fileName, this._constructCreateAndUpdateUrls(templateParameters, signedUrl));
      })
    );

    return updateUrls;
  }

  /**
   * Links hosting account with main account policies for cross account communication
   * @param accountMetadata - the attributes of the given hosting account from the onboarded CFN stack outputs
   *
   * @returns account record in DDB
   */
  public async createAccount(accountMetadata: CreateAccountRequest): Promise<Account> {
    const arns = await this._getArns();

    await this._attachAwsAccount({
      awsAccountId: accountMetadata.awsAccountId,
      arns: arns
    });

    const environmentInstanceFiles = this._getEnvironmentFilesPathForArn(arns.artifactBucketArn);

    return this._accountService.create({
      ...accountMetadata,
      environmentInstanceFiles
    });
  }

  public async updateAccount(updateAccountRequest: UpdateAccountRequest): Promise<Account> {
    return this._accountService.update({
      ...updateAccountRequest
    });
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
        Bucket: bucketName,
        ExpectedBucketOwner: process.env.MAIN_ACCT_ID
      });
      bucketPolicy = PolicyDocument.fromJson(JSON.parse(bucketPolicyResponse.Policy!));
    } catch (e) {
      // All errors should be thrown except "NoSuchBucketPolicy" error. For "NoSuchBucketPolicy" error we assign new bucket policy for bucket
      if (e instanceof NoSuchBucket) {
        throw e;
      }
    }
    bucketPolicy = this._updateBucketPolicyDocumentWithAllStatements(
      artifactBucketArn,
      awsAccountId,
      bucketPolicy
    );

    const putPolicyParams: PutBucketPolicyCommandInput = {
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy.toJSON()),
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    };

    // Update bucket policy
    try {
      await this._aws.clients.s3.putBucketPolicy(putPolicyParams);
    } catch (e) {
      if (
        e.name === 'MalformedPolicy' &&
        e.Detail === `"AWS" : "arn:aws:iam::${awsAccountId}:root"` &&
        e instanceof S3ServiceException
      ) {
        throw new InvalidAwsAccountIdError("Please provide a valid 'awsAccountId' for the hosting account");
      }
      throw e;
    }
  }

  private _updateBucketPolicyDocumentWithAllStatements(
    artifactBucketArn: string,
    awsAccountId: string,
    policyDocument: PolicyDocument
  ): PolicyDocument {
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

    const policyStatements = [listStatement, getStatement];

    return this._applyPoliciesToPolicyDocument(awsAccountId, policyDocument, policyStatements);
  }

  private _applyPoliciesToPolicyDocument(
    awsAccountId: string,
    policyDocument: PolicyDocument,
    policyStatements: PolicyStatement[]
  ): PolicyDocument {
    for (const statement of policyStatements) {
      // If policy statement doesn't exist, create one
      // We iterate through these 1 by 1 in case the policy exists, but may be missing the awsAccoutId
      if (!IamHelper.containsStatementId(policyDocument, statement.sid!)) {
        policyDocument.addStatements(statement);
      } else {
        // If List statement doesn't contain this accountId, add it
        policyDocument = IamHelper.addPrincipalToStatement(
          policyDocument,
          statement.sid!,
          `arn:aws:iam::${awsAccountId}:root`
        );
      }
    }
    return policyDocument;
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
  public async updateHostingAccountData(params: {
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

    // SSM documents, SC products and AMIs do not need to be shared since hosting account is same as main account
    if (targetAccountId !== process.env.MAIN_ACCT_ID!) {
      const ssmDocuments = await this._getSSMDocuments(this._stackName, ssmDocNameSuffix);
      await this._shareSSMDocument(ssmDocuments, targetAccountId);
      await this._shareAMIs(targetAccountId, JSON.parse(process.env.AMI_IDS_TO_SHARE!));
      await this._shareAndAcceptScPortfolio(
        targetAccountAwsService,
        targetAccountId as string,
        portfolioId as string
      );
      await this.cloneRole(targetAccountAwsService, roleToCopyToTargetAccount);
    }

    // This step are needed regardless of the hosting account being same or different w.r.t main account
    await this._associatePrincipalIamRoleWithPortfolio(
      targetAccountAwsService,
      principalArnForScPortfolio,
      portfolioId as string
    );

    await this._updateHostingAccountStatus(
      ddbAccountId,
      s3ArtifactBucketName,
      targetAccountAwsService,
      targetAccountStackName
    );
  }

  public async cloneRole(targetAws: AwsService, roleToCopyToTargetAccount: string): Promise<void> {
    const iamRoleCloneService = new IamRoleCloneService(this._aws, targetAws);
    await iamRoleCloneService.cloneRole(roleToCopyToTargetAccount);
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
    // Check if hosting account stack has the latest CFN template
    const onboardAccountS3Response = await this._aws.clients.s3.getObject({
      Bucket: s3ArtifactBucketName,
      Key: 'onboard-account.cfn.yaml',
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    });
    const onboardAccountByonResponse = await this._aws.clients.s3.getObject({
      Bucket: s3ArtifactBucketName,
      Key: 'onboard-account-byon.cfn.yaml',
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    });
    const streamToString = (stream: Readable): Promise<string> =>
      new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });
    const expectedTemplates: string[] = await Promise.all([
      streamToString(onboardAccountS3Response.Body! as Readable),
      streamToString(onboardAccountByonResponse.Body! as Readable)
    ]);
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

      const expectedTemplatesWithoutCommentsAndSpaces = expectedTemplates.map((template) => {
        return removeCommentsAndSpaces(template);
      });

      // If the actual template matches one of the expected template then the account is current
      if (expectedTemplatesWithoutCommentsAndSpaces.includes(removeCommentsAndSpaces(actualTemplate))) {
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

  private _getEnvironmentFilesPathForArn(artifactBucketArn: string): string {
    const parsedBucketArn = artifactBucketArn.replace('arn:aws:s3:::', '').split('/');
    const bucketName = parsedBucketArn[0];

    if (_.isEmpty(bucketName) || bucketName.length === 0) {
      console.error(`Could not identify bucket name in S3 artifact bucket ARN ${artifactBucketArn}`);
      throw Boom.internal(`Could not identify bucket name in S3 artifact bucket.`);
    }

    return `s3://${bucketName}/environment-files`;
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

  private async _getArns(): Promise<Arns> {
    const cfService = this._aws.helpers.cloudformation;
    const {
      [process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!]: statusHandlerArn,
      [process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!]: artifactBucketArn,
      [process.env.S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!]: s3ArtifactEncryptionArn,
      [process.env.S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY!]: s3DatasetsEncryptionArn
    } = await cfService.getCfnOutput(this._stackName, [
      process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!,
      process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!,
      process.env.S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!,
      process.env.S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY!
    ]);

    return {
      statusHandlerArn,
      artifactBucketArn,
      mainAcctEncryptionArnList: [s3ArtifactEncryptionArn, s3DatasetsEncryptionArn]
    };
  }

  private async _attachAwsAccount({
    awsAccountId,
    arns
  }: {
    awsAccountId: string;
    arns: Arns;
  }): Promise<void> {
    const { statusHandlerArn, artifactBucketArn, mainAcctEncryptionArnList } = arns;

    // Add account to artifactBucket's bucket policy
    await this.updateArtifactsBucketPolicy(artifactBucketArn, awsAccountId);

    // Update main account default event bus to accept hosting account state change events
    await this.updateBusPermissions(statusHandlerArn, awsAccountId);

    // Update main account encryption key policy
    await Promise.all(
      _.map(mainAcctEncryptionArnList, async (mainAcctEncryptionArn) => {
        await this.updateMainAccountEncryptionKeyPolicy(mainAcctEncryptionArn, awsAccountId);
      })
    );
  }

  private _constructCreateAndUpdateUrls(
    accountCfnTemplateParameters: AccountCfnTemplateParameters,
    signedUrl: string
  ): TemplateResponse {
    // see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-create-stacks-quick-create-links.html

    // We assume the hosting account's region is the same as where this lambda runs.
    const region = process.env.AWS_REGION;
    const {
      accountHandlerRole,
      apiHandlerRole,
      enableFlowLogs,
      externalId,
      launchConstraintPolicyPrefix,
      launchConstraintRolePrefix,
      mainAccountId,
      namespace,
      stackName,
      statusHandlerRole
    } = accountCfnTemplateParameters;
    const createUrl = [
      `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/create/review/`,
      `?templateURL=${encodeURIComponent(signedUrl)}`,
      `&stackName=${stackName}`,
      `&param_Namespace=${namespace}`,
      `&param_MainAccountId=${mainAccountId}`,
      `&param_ExternalId=${externalId}`,
      `&param_AccountHandlerRoleArn=${accountHandlerRole}`,
      `&param_ApiHandlerRoleArn=${apiHandlerRole}`,
      `&param_StatusHandlerRoleArn=${statusHandlerRole}`,
      `&param_EnableFlowLogs=${enableFlowLogs || 'true'}`,
      `&param_LaunchConstraintRolePrefix=${launchConstraintRolePrefix}`,
      `&param_LaunchConstraintPolicyPrefix=${launchConstraintPolicyPrefix}`
    ].join('');

    const updateUrl = [
      `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/update/template`,
      `?stackId=${encodeURIComponent(stackName)}`,
      `&templateURL=${encodeURIComponent(signedUrl)}`
    ].join('');

    return { createUrl, updateUrl };
  }
}
