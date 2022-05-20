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
    this.aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: process.env.STACK_NAME! });
  }

  public async launch(payload: {
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    envMetadata: any;
  }): Promise<void> {
    const updatedPayload = {
      project: payload.envMetadata.PROJ,
      operation: payload.operation,
      envType: payload.envType,
      ssmParameters: payload.ssmParameters,
    };

    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      project: payload.envMetadata.PROJ,
      operation: payload.operation,
      envType: payload.envType
    });

    try{
      const listLaunchPathResponse = await hostAwsSdk.clients.serviceCatalog.listLaunchPaths({
        ProductId: payload.envMetadata.ETC.productId
      });
      updatedPayload.ssmParameters.PathId = [listLaunchPathResponse.LaunchPathSummaries![0]!.Id!];
      await this.executeSSMDocument(updatedPayload);
    } catch(e){
      console.log(e);
      throw e;
    }
  }

  /**
   * Executing SSM Document in hosting account with provided envMetadata
   */
  public async executeSSMDocument(payload: {
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: any;
  }): Promise<void> {
    // Get SSM doc ARN from main account CFN stack (shared documents need to send ARN)
    const ssmDocArn = await this.getSSMDocArn(`${payload.envType}${payload.operation}${this.ssmDocSuffix}`);

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      project: payload.project,
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
      return output.OutputKey && output.OutputKey.toLowerCase() === ssmDocOutputName.toLowerCase();
    });
    if (ssmDocOutput && ssmDocOutput.OutputValue) {
      return ssmDocOutput.OutputValue;
    } else {
      throw new Error(`Cannot find output name: ${ssmDocOutputName}`);
    }
  }

  public async getAwsSdkForEnvMgmtRole(payload: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project: any;
    operation: string;
    envType: string;
  }): Promise<AwsService> {
    console.log(`Assuming EnvMgmt role in ${payload.project.awsAccountId} account`);
    const { envMgmtRoleArn, externalId } = payload.project;
    console.log(`Assuming EnvMgmt role ${envMgmtRoleArn} with externalId ${externalId}`);
    const params = {
      roleArn: envMgmtRoleArn,
      roleSessionName: `${payload.operation}-${payload.envType}-${Date.now()}`,
      region: process.env.AWS_REGION!,
      externalId
    };

    const hostSdk = await this.aws.getAwsServiceForRole(params);

    return hostSdk;
  }
}
