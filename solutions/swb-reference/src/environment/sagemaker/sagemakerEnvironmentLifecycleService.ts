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
    // TODO: Get value from aws-accounts in DDB
    const hostingAccountEventBusArn = 'arn:aws:events:us-east-2:123456789012:event-bus/bus-123';

    const productId = 'prod-abc';
    // TODO: All these values will be pulled from DDB for the given hosting account and for the given envTypeConfig
    const ssmParameters = {
      InstanceName: [`basicnotebookinstance-${Date.now()}`],
      VPC: ['vpc-abcd'],
      Subnet: ['subnet-abcd'],
      ProvisioningArtifactId: ['pa-abcd'],
      ProductId: [productId],
      Namespace: [`sagemaker-${Date.now()}`],
      EncryptionKeyArn: ['arn:aws:kms:us-east-2:123456789012:key/abc'],
      CIDR: ['1.1.1.1/32'],
      PathId: ['samplePathId'],
      EventBusName: [hostingAccountEventBusArn],
      EnvId: ['sampleEnvId'],
      EnvironmentInstanceFiles: ['s3://s3-artifact-123/environment-files'],
      AutoStopIdleTimeInMinutes: ['0']
    };

    const responseHost = await this.helper.launch({
      ssmParameters,
      operation: 'Launch',
      envType: 'Sagemaker',
      accountId: envMetadata.accountId,
      productId
    });
    return Promise.resolve(responseHost);
  }

  public async terminate(envId: string): Promise<{ [id: string]: string }> {
    // TODO: Get envMetadata for the given envId from DDB
    const envMetadata = { envId, accountId: '123456789012', provisionedProductId: 'pp-abcd' };

    // TODO: Get value from aws-accounts in DDB
    const hostingAccountEventBusArn = 'arn:aws:events:us-east-2:123456789012:event-bus/bus-123';

    // TODO: All these values will be pulled from DDB for the given hosting account
    const ssmParameters = {
      ProvisionedProductId: [envMetadata.provisionedProductId],
      TerminateToken: [uuidv4()],
      EventBusName: [hostingAccountEventBusArn]
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
