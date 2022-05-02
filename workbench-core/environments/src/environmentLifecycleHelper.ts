/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';

export type Operation = 'Launch' | 'Terminate';
export default class EnvironmentLifecycleHelper {
  public aws: AwsService;
  public ssmDocSuffix: string;
  public constructor() {
    this.ssmDocSuffix = process.env.SSM_DOC_NAME_SUFFIX!;
    this.aws = new AwsService({ region: process.env.AWS_REGION! });
  }

  public async launch(payload: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    accountId: string;
    productId: string;
  }): Promise<{ [id: string]: string }> {
    const updatedPayload = payload;

    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      accountId: payload.accountId,
      operation: payload.operation,
      envType: payload.envType
      // TODO: Get the same external ID as used during this hosting account's onboarding from DDB and use it here
      // Note: empty string is not the same as undefined
      // externalId: <accountIdDDBMetadata>.externalId
    });

    const listLaunchPathResponse = await hostAwsSdk.clients.serviceCatalog.listLaunchPaths({
      ProductId: payload.productId
    });
    updatedPayload.ssmParameters.PathId = [listLaunchPathResponse.LaunchPathSummaries![0]!.Id!];
    return this.executeSSMDocument(updatedPayload);
  }
  /**
   * Executing SSM Document in hosting account with provided envMetadata
   *
   * TODO: Return and store DDB entry for environment
   */
  public async executeSSMDocument(payload: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    accountId: string;
  }): Promise<{ [id: string]: string }> {
    // Get SSM doc ARN from main account CFN stack (shared documents need to send ARN)
    const ssmDocArn = await this.getSSMDocArn(`${payload.envType}${payload.operation}${this.ssmDocSuffix}`);

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      accountId: payload.accountId,
      operation: payload.operation,
      envType: payload.envType
      // TODO: Get the same external ID as used during this hosting account's onboarding from DDB and use it here
      // Note: empty string is not the same as undefined
      // externalId: <accountIdDDBMetadata>.externalId
    });

    // Execute SSM document in hosting account
    if (hostAwsSdk) {
      await hostAwsSdk.clients.ssm.startAutomationExecution({
        DocumentName: ssmDocArn,
        Parameters: payload.ssmParameters
      });
    }

    return { envId: 'sampleEnvId' };
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

  public async getEnvMgmtRoleArn(accountId: string): Promise<string> {
    // TODO: Get metadata from DDB for the given hosting account ID, and return its EnvMgmtRoleArn
    return Promise.resolve(`arn:aws:iam::${accountId}:role/EnvMgmtRole`);
  }

  public async getAwsSdkForEnvMgmtRole(payload: {
    operation: string;
    accountId: string;
    envType: string;
    externalId?: string;
  }): Promise<AwsService> {
    const envMgmtRoleArn = await this.getEnvMgmtRoleArn(payload.accountId);
    const hostAwsSdk = await this.aws.getAwsServiceForRole({
      roleArn: envMgmtRoleArn,
      roleSessionName: `${payload.operation}-${payload.envType}-${Date.now()}`,
      region: process.env.AWS_REGION!,
      externalId: payload.externalId
    });

    return hostAwsSdk;
  }

  /*
   * Store new/updated environment metadata information in DDB
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async storeToDdb(envMetadata: any): Promise<void> {
    // TODO: Add DDB calls here once access patterns are established in @amzn/workbench-core-base
    return Promise.resolve();
  }

  /*
   * Get main account's EventBridge bus arn
   */
  public async getMainEventBusArn(): Promise<string> {
    const describeStackParam = {
      StackName: process.env.STACK_NAME!
    };

    const stackDetails = await this.aws.clients.cloudformation.describeStacks(describeStackParam);

    const eventBusArnOutput = stackDetails.Stacks![0].Outputs!.find((output: Output) => {
      return output.OutputKey && output.OutputKey === process.env.MAIN_ACCOUNT_BUS_ARN_NAME!;
    });
    return eventBusArnOutput?.OutputValue!;
  }
}
