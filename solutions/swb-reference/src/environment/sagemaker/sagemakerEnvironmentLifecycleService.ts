/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AccountsService,
  EnvironmentLifecycleService,
  EnvironmentLifecycleHelper,
  EnvironmentStatus
} from '@amzn/environments';
import { AwsService } from '@amzn/workbench-core-base';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export default class SagemakerEnvironmentLifecycleService implements EnvironmentLifecycleService {
  public helper: EnvironmentLifecycleHelper;
  public aws: AwsService;
  public constructor() {
    this.helper = new EnvironmentLifecycleHelper();
    this.aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: process.env.STACK_NAME! });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async launch(envMetadata: any): Promise<{ [id: string]: string }> {
    // Check if launch operation is valid for request body
    if (envMetadata.envId) {
      throw new Error('envId cannot be passed in the request body when trying to launch a new environment');
    }

    const accountsService = new AccountsService();

    // Get value from account in DDB
    const accountDetails = await accountsService.get(envMetadata.accountId);
    const hostingAccountEventBusArn = accountDetails!.eventBusArn!.S!;
    const encryptionKeyArn = accountDetails!.encryptionKeyArn!.S!;
    const vpcId = accountDetails!.vpcId!.S!;
    const subnetId = accountDetails!.subnetId!.S!;
    const cidr = accountDetails!.cidr!.S!;
    const environmentInstanceFiles = accountDetails!.environmentInstanceFiles!.S!;

    const envId = uuidv4();

    // TODO: Some of these values will come from env type config
    const ssmParameters = {
      InstanceName: [`basicnotebookinstance-${Date.now()}`],
      VPC: [vpcId],
      Subnet: [subnetId],
      ProvisioningArtifactId: [envMetadata.provisioningArtifactId],
      ProductId: [envMetadata.productId],
      Namespace: [`sagemaker-${Date.now()}`],
      EncryptionKeyArn: [encryptionKeyArn],
      CIDR: [cidr], // from env type config
      InstanceSize: ['ml.t3.large'], // from env type config
      EventBusName: [hostingAccountEventBusArn],
      EnvId: [envId],
      EnvironmentInstanceFiles: [environmentInstanceFiles],
      AutoStopIdleTimeInMinutes: ['0'],
      EnvStatusUpdateConstString: [process.env.ENV_STATUS_UPDATE!]
    };

    await this.helper.launch({
      ssmParameters,
      operation: 'Launch',
      envType: 'Sagemaker',
      accountId: accountDetails!.accountId!.S!,
      productId: envMetadata.productId
    });

    const envDetails = {
      id: { S: envId },
      accountId: { S: envMetadata.accountId },
      awsAccountId: { S: accountDetails!.awsAccountId!.S! },
      envTypeId: { S: `${envMetadata.productId}-${envMetadata.provisioningArtifactId}` },
      resourceType: { S: 'environment' },
      status: { S: 'PENDING' as EnvironmentStatus }
    };

    // Store env row in DDB
    await this.helper.storeToDdb(`ENV#${envId}`, `ENV#${envId}`, envDetails);

    // Store env-account row in DDB
    await this.helper.storeToDdb(`ENV#${envId}`, `ACC#${envMetadata.accountId}`, accountDetails!);

    return { ...envMetadata, envId, status: 'PENDING' };
  }

  public async terminate(envId: string): Promise<{ [id: string]: string }> {
    // Get value from env in DDB
    const envDetails = await this.helper.getEnvDDBEntry(envId);
    const accountId = envDetails.accountId!.S!;
    const provisionedProductId = envDetails.provisionedProductId!.S!; // This is updated by status handler

    const accountsService = new AccountsService();
    const { eventBusArn } = await accountsService.get(accountId, ['eventBusArn']);

    const ssmParameters = {
      ProvisionedProductId: [provisionedProductId],
      TerminateToken: [uuidv4()],
      EventBusName: [eventBusArn!.S!],
      EnvId: [envId],
      EnvStatusUpdateConstString: [process.env.ENV_STATUS_UPDATE!]
    };

    // Execute termination doc
    await this.helper.executeSSMDocument({
      ssmParameters,
      operation: 'Terminate',
      envType: 'Sagemaker',
      accountId
    });

    envDetails.status = { S: 'TERMINATING' as EnvironmentStatus };

    // Store env row in DDB
    await this.helper.storeToDdb(`ENV#${envId}`, `ENV#${envId}`, envDetails);

    return { envId, status: 'TERMINATING' };
  }

  public async start(envId: string): Promise<{ [id: string]: string }> {
    // Get value from env in DDB
    const envDetails = await this.helper.getEnvDDBEntry(envId);
    const accountId = envDetails.accountId!.S!;

    const key = { key: { name: 'pk', value: { S: `ENV#${envId}` } } };
    const ddbEntries = await this.aws.helpers.ddb.query(key).execute();
    const instanceRecord = _.find(ddbEntries.Items!, (entry) => {
      return entry!.sk?.S!.startsWith('INID#');
    });

    const instanceName = instanceRecord!.sk!.S!.split('INID#')[1];

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.helper.getAwsSdkForEnvMgmtRole({
      accountId,
      operation: 'Start',
      envType: 'Sagemaker'
    });

    await hostAwsSdk.clients.sagemaker.startNotebookInstance({ NotebookInstanceName: instanceName });

    envDetails.status = { S: 'STARTING' as EnvironmentStatus };

    // Store env row in DDB
    await this.helper.storeToDdb(`ENV#${envId}`, `ENV#${envId}`, envDetails);

    return { envId, status: 'STARTING' };
  }

  public async stop(envId: string): Promise<{ [id: string]: string }> {
    // Get value from env in DDB
    const envDetails = await this.helper.getEnvDDBEntry(envId);
    const accountId = envDetails.accountId!.S!;

    const key = { key: { name: 'pk', value: { S: `ENV#${envId}` } } };
    const ddbEntries = await this.aws.helpers.ddb.query(key).execute();
    const instanceRecord = _.find(ddbEntries.Items!, (entry) => {
      return entry!.sk?.S!.startsWith('INID#');
    });
    const instanceName = instanceRecord!.sk!.S!.split('INID#')[1];

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.helper.getAwsSdkForEnvMgmtRole({
      accountId,
      operation: 'Start',
      envType: 'Sagemaker'
    });

    await hostAwsSdk.clients.sagemaker.stopNotebookInstance({ NotebookInstanceName: instanceName });

    envDetails.status = { S: 'STOPPING' as EnvironmentStatus };

    // Store env row in DDB
    await this.helper.storeToDdb(`ENV#${envId}`, `ENV#${envId}`, envDetails);

    return { envId, status: 'STOPPING' };
  }
}
