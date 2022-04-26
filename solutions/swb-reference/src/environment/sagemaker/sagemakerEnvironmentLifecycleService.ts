/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentLifecycleService, EnvironmentLifecycleHelper } from '@amzn/environments';
import { AwsService } from '@amzn/workbench-core-base';
import { v4 as uuidv4 } from 'uuid';

export default class SagemakerEnvironmentLifecycleService implements EnvironmentLifecycleService {
  public helper: EnvironmentLifecycleHelper;
  public aws: AwsService;
  public constructor() {
    this.helper = new EnvironmentLifecycleHelper();
    this.aws = new AwsService({ region: process.env.AWS_REGION! });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async launch(envMetadata: any): Promise<{ [id: string]: string }> {
    // Check if launch operation is valid for request body
    if (envMetadata.envId) {
      throw new Error('envId cannot be passed in the request body when trying to launch a new environment');
    }
    const mainEventBusArn = await this.helper.getMainEventBusArn();

    // TODO: All these values will be pulled from DDB for the given hosting account and for the given envTypeConfig
    const ssmParameters = {
      InstanceName: ['basicnotebookinstance-sampleInstanceName'],
      VPC: ['vpc-028df59e55564dccd'],
      Subnet: ['subnet-0dee693d27b04fe37'],
      ProvisioningArtifactId: ['pa-3lex77o7ju3qw'],
      ProductId: ['prod-q4zwyzxpt5c7c'],
      Namespace: ['swbv2-test'],
      EncryptionKeyArn: ['sampleEncryptionKeyArn'],
      CIDR: ['1.1.1.1/32'],
      PathId: ['samplePathId'],
      EventBusName: [mainEventBusArn]
    };

    const responseHost = await this.helper.executeSSMDocument({
      ssmParameters,
      operation: 'Launch',
      envType: 'Sagemaker',
      accountId: envMetadata.accountId
    });
    return Promise.resolve(responseHost);
  }

  public async terminate(envId: string): Promise<{ [id: string]: string }> {
    // TODO: Get envMetadata for the given envId from DDB
    const envMetadata = { envId, accountId: 'placeholderAccountId' };

    const mainEventBusArn = await this.helper.getMainEventBusArn();

    // TODO: All these values will be pulled from DDB for the given hosting account
    const ssmParameters = {
      ProvisionedProductId: ['sampleProvisionedProductId'],
      TerminateToken: [uuidv4()],
      InstanceName: ['basicnotebookinstance-sampleInstanceName'],
      EventBusName: [mainEventBusArn]
    };

    const responseHost = await this.helper.executeSSMDocument({
      ssmParameters,
      operation: 'Terminate',
      envType: 'Sagemaker',
      accountId: envMetadata.accountId
    });
    return Promise.resolve(responseHost);
  }

  public async start(envId: string): Promise<{ [id: string]: string }> {
    /*
      TODO
       1. Get instance details from DDB for the given envId
       2. Assume hosting account IAM role
       3. Use SDK API to start instance using `start-notebook-instance` command
       4. Write to DDB that envStatus is STARTING
    */
    return { envId }; // This would contain an object containing envMetadata details with status "STARTING"
  }

  public async stop(envId: string): Promise<{ [id: string]: string }> {
    /*
      TODO
       1. Get instance details from DDB for the given envId
       2. Assume hosting account IAM role
       3. Use SDK API to stop instance using `stop-notebook-instance` command
       4. Write to DDB that envStatus is STOPPING
    */

    return { envId }; // This would contain an object containing envMetadata details with status "STOPPING"
  }
}
