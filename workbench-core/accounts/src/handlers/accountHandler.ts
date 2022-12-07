/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@aws/workbench-core-base';
import AccountService from '../services/accountService';
import HostingAccountLifecycleService from '../utilities/hostingAccountLifecycleService';

export default class AccountHandler {
  private _mainAccountAwsService: AwsService;
  private _hostingAccountLifecycleService: HostingAccountLifecycleService;
  private _accountService: AccountService;

  public constructor(
    mainAccountAwsService: AwsService,
    accountService: AccountService,
    hostingAccountLifecycleService: HostingAccountLifecycleService
  ) {
    this._mainAccountAwsService = mainAccountAwsService;
    this._hostingAccountLifecycleService = hostingAccountLifecycleService;
    this._accountService = accountService;
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
  public async execute(event: any): Promise<void> {
    // eslint-disable-next-line
    const hostingAccounts = await this._getAccountMetadata();
    const portfolioName = process.env.SC_PORTFOLIO_NAME!;
    const portfolioId = await this._mainAccountAwsService.helpers.serviceCatalog.getPortfolioId(
      portfolioName
    );
    if (portfolioId === undefined) {
      throw new Error(`Could not find portfolioId for portfolio: ${portfolioName}`);
    }

    const cfService = this._mainAccountAwsService.helpers.cloudformation;
    const {
      [process.env.LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY!]: launchConstraintRoleName,
      [process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!]: s3ArtifactBucketArn
    } = await cfService.getCfnOutput(process.env.STACK_NAME!, [
      process.env.LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY!,
      process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!
    ]);

    for (const hostingAccount of hostingAccounts) {
      const hostingAccountId = this._getAccountId(hostingAccount.hostingAccountHandlerRoleArn);
      let hostingAccountAwsService: AwsService;
      try {
        hostingAccountAwsService = await this._mainAccountAwsService.getAwsServiceForRole({
          roleArn: hostingAccount.hostingAccountHandlerRoleArn,
          roleSessionName: 'account-handler',
          externalId: hostingAccount.externalId,
          region: process.env.AWS_REGION!
        });
      } catch (e) {
        console.log(
          `Cannot assume role ${
            hostingAccount.hostingAccountHandlerRoleArn
          } for hosting account. Skipping setup for this account: \n${JSON.stringify(e)}`
        );
        continue;
      }

      const s3ArtifactBucketName = s3ArtifactBucketArn.split(':').pop() || '';
      await this._hostingAccountLifecycleService.updateHostingAccountData({
        ddbAccountId: hostingAccount.id,
        targetAccountId: hostingAccountId,
        targetAccountAwsService: hostingAccountAwsService,
        targetAccountStackName: hostingAccount.stackName,
        portfolioId,
        ssmDocNameSuffix: process.env.SSM_DOC_OUTPUT_KEY_SUFFIX!,
        principalArnForScPortfolio: hostingAccount.envMgmtRoleArn,
        roleToCopyToTargetAccount: launchConstraintRoleName,
        s3ArtifactBucketName
      });
    }
  }

  /**
   * Return 12 digit aws account id of the role
   * @param iamRoleArn - IAM role arn
   */
  private _getAccountId(iamRoleArn: string): string {
    const match = iamRoleArn.match(/::(\d{12}):role/);
    if (match) {
      return match[1];
    }
    throw new Error(`Cannot find accountId from arn: ${iamRoleArn}`);
  }

  private async _getAccountMetadata(): Promise<
    {
      id: string;
      stackName: string;
      hostingAccountHandlerRoleArn: string;
      envMgmtRoleArn: string;
      externalId: string;
    }[]
  > {
    const accounts = await this._accountService.getAllAccounts({
      index: 'getResourceByCreatedAt',
      key: { name: 'resourceType', value: 'account' }
    });

    return accounts.map((account) => {
      return {
        id: account.id!,
        stackName: account.stackName,
        hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId || ''
      };
    });
  }
}
