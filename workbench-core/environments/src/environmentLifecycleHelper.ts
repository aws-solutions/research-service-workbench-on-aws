/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

export type Operation = 'Launch' | 'Terminate';

export default class EnvironmentLifecycleHelper {
  public aws: AwsService;
  public ssmDocSuffix: string;
  public constructor() {
    this.ssmDocSuffix = process.env.SSM_DOC_NAME_SUFFIX!;
    this.aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: process.env.STACK_NAME! });
  }

  public async launch(payload: {
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    accountId: string;
    productId: string;
  }): Promise<void> {
    const updatedPayload = payload;

    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      accountId: payload.accountId,
      operation: payload.operation,
      envType: payload.envType
    });

    const listLaunchPathResponse = await hostAwsSdk.clients.serviceCatalog.listLaunchPaths({
      ProductId: payload.productId
    });
    updatedPayload.ssmParameters.PathId = [listLaunchPathResponse.LaunchPathSummaries![0]!.Id!];
    return this.executeSSMDocument(updatedPayload);
  }

  /**
   * Executing SSM Document in hosting account with provided envMetadata
   */
  public async executeSSMDocument(payload: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    accountId: string;
  }): Promise<void> {
    // Get SSM doc ARN from main account CFN stack (shared documents need to send ARN)
    const ssmDocArn = await this.getSSMDocArn(`${payload.envType}${payload.operation}${this.ssmDocSuffix}`);

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      accountId: payload.accountId,
      operation: payload.operation,
      envType: payload.envType
    });

    // Execute SSM document in hosting account
    if (hostAwsSdk) {
      await hostAwsSdk.clients.ssm.startAutomationExecution({
        DocumentName: ssmDocArn,
        Parameters: payload.ssmParameters
      });
    }
  }

  public async getSSMDocArn(ssmDocOutputName: string): Promise<string> {
    const describeStackParam = {
      StackName: process.env.STACK_NAME!
    };
    const stackDetails = await this.aws.clients.cloudformation.describeStacks(describeStackParam);

    const ssmDocOutput = stackDetails.Stacks![0].Outputs!.find((output: Output) => {
      return output.OutputKey && output.OutputKey === ssmDocOutputName;
    });
    if (ssmDocOutput && ssmDocOutput.OutputValue) {
      return ssmDocOutput.OutputValue;
    } else {
      throw new Error(`Cannot find output name: ${ssmDocOutputName}`);
    }
  }

  private async _getEnvMgmtRoleArn(
    accountId: string
  ): Promise<{ envMgmtRoleArn: string; externalId: string | undefined }> {
    // Get metadata from DDB for the given hosting account ID, and return its EnvMgmtRoleArn
    const accountEntry = await this.aws.helpers.ddb
      .get({ pk: { S: `ACC#${accountId}` }, sk: { S: `ACC#${accountId}` } })
      .execute();
    const accountDetails = 'Item' in accountEntry ? accountEntry.Item : undefined;
    return {
      envMgmtRoleArn: accountDetails!.envManagementRoleArn!.S!,
      externalId: accountDetails!.externalId?.S
    };
  }

  public async getAwsSdkForEnvMgmtRole(payload: {
    operation: string;
    accountId: string;
    envType: string;
  }): Promise<AwsService> {
    const { envMgmtRoleArn, externalId } = await this._getEnvMgmtRoleArn(payload.accountId);
    const params = {
      roleArn: envMgmtRoleArn,
      roleSessionName: `${payload.operation}-${payload.envType}-${Date.now()}`,
      region: process.env.AWS_REGION!,
      externalId
    };

    return this.aws.getAwsServiceForRole(params);
  }

  /*
   * Store information to DDB
   * There are multiple access patterns for environment-related resources, so keeping this method rather flexible
   */
  public async storeToDdb(
    pk: string,
    sk: string,
    envDetails: { [key: string]: AttributeValue }
  ): Promise<void> {
    const envKey = { pk: { S: pk }, sk: { S: sk } };

    console.log(
      `Storing to DDB : envKey: ${JSON.stringify(envKey)}, \n envDetails: ${JSON.stringify(envDetails)}`
    );

    await this.aws.helpers.ddb.update(envKey, { item: envDetails }).execute();
  }
}
