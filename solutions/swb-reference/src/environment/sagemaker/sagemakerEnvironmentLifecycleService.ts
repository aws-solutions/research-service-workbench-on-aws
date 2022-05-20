/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  EnvironmentLifecycleService,
  EnvironmentLifecycleHelper,
  EnvironmentService
} from '@amzn/environments';
import { AwsService } from '@amzn/workbench-core-base';
import { v4 as uuidv4 } from 'uuid';

export default class SagemakerEnvironmentLifecycleService implements EnvironmentLifecycleService {
  public helper: EnvironmentLifecycleHelper;
  public aws: AwsService;
  public envService: EnvironmentService;
  public constructor() {
    this.helper = new EnvironmentLifecycleHelper();
    this.aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: process.env.STACK_NAME! });
    this.envService = new EnvironmentService({TABLE_NAME: process.env.STACK_NAME!});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async launch(envMetadata: any): Promise<{ [id: string]: string }> {
    // Check if launch operation is valid for request body
    if (envMetadata.envId) {
      throw new Error('envId cannot be passed in the request body when trying to launch a new environment');
    }

    // TODO: Some of these values will come from env type config params, while rest are account specific (attributes copied in project)
    const ssmParameters = {
      InstanceName: [`basicnotebookinstance-${Date.now()}`],
      VPC: [envMetadata.PROJ.vpcId],
      Subnet: [envMetadata.PROJ.subnetId],
      ProvisioningArtifactId: [envMetadata.ETC.provisioningArtifactId],
      ProductId: [envMetadata.ETC.productId],
      Namespace: [`sagemaker-${Date.now()}`],
      EncryptionKeyArn: [envMetadata.PROJ.encryptionKeyArn],
      CIDR: ['1.1.1.1/32'], // TODO: from env type config params
      InstanceSize: ['ml.t3.large'], // TODO: from env type config params
      EventBusName: [envMetadata.PROJ.hostingAccountEventBusArn],
      EnvId: [envMetadata.id],
      EnvironmentInstanceFiles: [envMetadata.PROJ.environmentInstanceFiles],
      AutoStopIdleTimeInMinutes: ['0'], // from env type config params
      EventBridgeStatusUpdateEventType: [process.env.EB_EVENT_TYPE_STATUS_UPDATE!]
    };

    await this.helper.launch({
      ssmParameters,
      operation: 'Launch',
      envType: 'Sagemaker',
      envMetadata
    });

    return { ...envMetadata, status: 'PENDING' };
  }

  public async terminate(envId: string): Promise<{ [id: string]: string }> {
    // Get value from env in DDB
    const envDetails = await this.envService.getEnvironment(envId, true);
    const eventBusArn = envDetails.PROJ.hostingAccountEventBusArn;
    const provisionedProductId = envDetails.provisionedProductId!; // This is updated by status handler

    const ssmParameters = {
      ProvisionedProductId: [provisionedProductId],
      TerminateToken: [uuidv4()],
      EventBusName: [eventBusArn],
      EnvId: [envId],
      EventBridgeStatusUpdateEventType: [process.env.EB_EVENT_TYPE_STATUS_UPDATE!]
    };

    // Execute termination doc
    await this.helper.executeSSMDocument({
      ssmParameters,
      operation: 'Terminate',
      envType: 'Sagemaker',
      project: envDetails.PROJ,
    });

    // Store env row in DDB
    await this.envService.updateEnvironment(envId, {status: 'TERMINATING'});

    return { envId, status: 'TERMINATING' };
  }

  public async start(envId: string): Promise<{ [id: string]: string }> {
    // Get value from env in DDB
    const envDetails = await this.envService.getEnvironment(envId, true);
    const instanceName = envDetails.instanceId;

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.helper.getAwsSdkForEnvMgmtRole({
      project: envDetails.PROJ,
      operation: 'Start',
      envType: 'Sagemaker'
    });

    await hostAwsSdk.clients.sagemaker.startNotebookInstance({ NotebookInstanceName: instanceName });

    // Store env row in DDB
    await this.envService.updateEnvironment(envId, {status: 'STARTING'});

    return { envId, status: 'STARTING' };
  }

  public async stop(envId: string): Promise<{ [id: string]: string }> {
    // Get value from env in DDB
    const envDetails = await this.envService.getEnvironment(envId, true);
    const instanceName = envDetails.instanceId;

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.helper.getAwsSdkForEnvMgmtRole({
      project: envDetails.PROJ,
      operation: 'Start',
      envType: 'Sagemaker'
    });

    await hostAwsSdk.clients.sagemaker.stopNotebookInstance({ NotebookInstanceName: instanceName });

    envDetails.status = 'STOPPING';

    // Store env row in DDB
    await this.envService.updateEnvironment(envId, {status: 'STOPPING'});

    return { envId, status: 'STOPPING' };
  }
}
