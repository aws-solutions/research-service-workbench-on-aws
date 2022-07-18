/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@amzn/workbench-core-audit';
import { AwsService, AuditLogger } from '@amzn/workbench-core-base';
import {
  DataSetService,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin
} from '@amzn/workbench-core-datasets';
import { LoggingService } from '@amzn/workbench-core-logging';
import { Output } from '@aws-sdk/client-cloudformation';
import _ from 'lodash';
import envResourceTypeToKey from '../constants/environmentResourceTypeToKey';
import { Environment, EnvironmentService } from '../services/environmentService';

export type Operation = 'Launch' | 'Terminate';

export default class EnvironmentLifecycleHelper {
  public aws: AwsService;
  public ssmDocSuffix: string;
  public dataSetService: DataSetService;
  public environmentService: EnvironmentService;
  public constructor() {
    this.ssmDocSuffix = process.env.SSM_DOC_NAME_SUFFIX!;
    this.aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: process.env.STACK_NAME! });
    const logger: LoggingService = new LoggingService();
    this.dataSetService = new DataSetService(
      new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
      logger,
      new DdbDataSetMetadataPlugin(this.aws, 'DATASET', 'ENDPOINT')
    );
    this.environmentService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
  }

  /**
   * Launch an environment by executing SSM document
   * @param payload - contains the following:
   * * @param ssmParameters - the list of input parameters for SSM doc execution
   * * @param operation - the operation type - eg. 'Launch'
   * * @param envType - the env type name - eg. 'sagemaker'
   * * @param envMetadata - the environment to launch
   *
   * @returns null
   */
  public async launch(payload: {
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    envMetadata: any;
  }): Promise<void> {
    const updatedPayload = {
      envMgmtRoleArn: payload.envMetadata.PROJ.envMgmtRoleArn,
      externalId: payload.envMetadata.PROJ.externalId,
      operation: payload.operation,
      envType: payload.envType,
      ssmParameters: payload.ssmParameters
    };

    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      envMgmtRoleArn: payload.envMetadata.PROJ.envMgmtRoleArn,
      externalId: payload.envMetadata.PROJ.externalId,
      operation: payload.operation,
      envType: payload.envType
    });

    try {
      const listLaunchPathResponse = await hostAwsSdk.clients.serviceCatalog.listLaunchPaths({
        ProductId: payload.envMetadata.ETC.productId
      });
      updatedPayload.ssmParameters.PathId = [listLaunchPathResponse.LaunchPathSummaries![0]!.Id!];
      await this.executeSSMDocument(updatedPayload);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Executing SSM Document in hosting account with provided envMetadata
   * @param ssmParameters - the list of input parameters for SSM doc execution
   * @param operation - the operation type - eg. 'Launch'
   * @param envType - the env type name - eg. 'sagemaker'
   * @param envMgmtRoleArn - ARN of the envMgmtRole on the hosting account for SSM doc to assume
   * @param externalId - external ID string if declared at the time of onboarding hosting account, for role assumption
   *
   * @returns null
   */
  public async executeSSMDocument(payload: {
    ssmParameters: { [key: string]: string[] };
    operation: Operation;
    envType: string;
    envMgmtRoleArn: string;
    externalId?: string;
  }): Promise<void> {
    // Get SSM doc ARN from main account CFN stack (shared documents need to send ARN)
    const ssmDocArn = await this.getSSMDocArn(`${payload.envType}${payload.operation}${this.ssmDocSuffix}`);

    // Assume hosting account EnvMgmt role
    const hostAwsSdk = await this.getAwsSdkForEnvMgmtRole({
      envMgmtRoleArn: payload.envMgmtRoleArn,
      externalId: payload.externalId,
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

  private _generateEndpointName(envId: string, datasetId: string): string {
    return `${datasetId.slice(0, 13)}-mounted-on-${envId.slice(0, 13)}`;
  }

  /**
   * Delete the access points for all datasets attached to a given workspace.
   * @param envMetadata - the environment for which access point(s) were created
   */
  public async removeAccessPoints(envMetadata: Environment): Promise<void> {
    if (_.isEmpty(envMetadata.datasetIds)) return;

    await Promise.all(
      _.map(envMetadata.ENDPOINTS, async (endpoint) => {
        await this.dataSetService.removeDataSetExternalEndpoint(
          endpoint.dataSetId,
          endpoint.id,
          new S3DataSetStoragePlugin(this.aws)
        );
      })
    );
  }

  /**
   * Get the mount strings for all datasets attached to a given workspace.
   * @param dataSetIds - the list of datasets attached.
   * @param envMetadata - the environment on which to mount the dataset(s)
   *
   * @returns an object containing:
   *  1. datasetsToMount - A string of a list of strigified mountString objects (curly brackets escaped for tsdoc):
   *     '["\{\"name\":\"testDs\",\"bucket\":\"s3://arn:aws:s3:us-east-1:<AcctID>:accesspoint/<randomStr>/\",\"prefix\":\"samplePath\",\"endpointId\":\"sampleEndpointId\"\}"]'
   *  2. Stringified IAM policy to be assigned to the workspace role
   */
  public async getDatasetsToMount(
    datasetIds: Array<string>,
    envMetadata: Environment
  ): Promise<{ [id: string]: string }> {
    if (_.isEmpty(datasetIds)) return { S3Mounts: '[]', IamPolicyDocument: '{}' };

    // TODO: Allow multiple datasets to be mounted per workspace post-preview
    if (datasetIds.length > 1) throw new Error('Cannot mount more than one dataset per workspace');

    const envId = envMetadata.id!;

    const datasetsToMount = await Promise.all(
      _.map(datasetIds, async (datasetId) => {
        const mountObject = await this.dataSetService.addDataSetExternalEndpoint(
          datasetId,
          // Using envId to name endpoint for better mapping (each env has its own endpoint)
          envId,
          new S3DataSetStoragePlugin(this.aws)
        );

        const dataSet = await this.dataSetService.getDataSet(datasetId);
        const endpoint = await this.dataSetService.getExternalEndPoint(datasetId, mountObject.endpointId);
        await this.environmentService.addMetadata(
          envId,
          envResourceTypeToKey.environment,
          mountObject.endpointId,
          envResourceTypeToKey.endpoint,
          {
            id: endpoint.id!,
            dataSetId: endpoint.dataSetId,
            endPointUrl: endpoint.endPointUrl,
            path: endpoint.path,
            storageArn: `arn:aws:s3:::${dataSet.storageName}` // TODO: Handle non-S3 storage types in future
          }
        );
        return JSON.stringify({
          name: mountObject.name,
          bucket: mountObject.bucket,
          prefix: mountObject.prefix
        });
      })
    );

    const updatedEnv = await this.environmentService.getEnvironment(envId, true);

    // Call IAM policy generator here, and return both strings
    const IamPolicyDocument = this.generateIamPolicy(updatedEnv);
    const S3Mounts = JSON.stringify(datasetsToMount);

    return { S3Mounts, IamPolicyDocument };
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

  public async addRoleToAccessPoint(envDetails: Environment, instanceRoleArn: string): Promise<void> {
    const s3DataSetStoragePlugin = new S3DataSetStoragePlugin(this.aws);

    await Promise.all(
      // for each dataset linked to env
      _.map(envDetails.ENDPOINTS, async (endpoint) => {
        // link instance role to dataset endpoint
        await this.dataSetService.addRoleToExternalEndpoint(
          endpoint.dataSetId,
          endpoint.id,
          instanceRoleArn,
          s3DataSetStoragePlugin
        );
      })
    );
  }

  /**
   * Get the workspace IAM policy for accessing all datasets attached.
   * @param envMetadata - the environment with list of dataset IDs
   * @param encryptionKeyArn - the encryption key ARN for env data traffic
   *
   * @returns iamPolicy - A stringified IAM policy
   */
  public generateIamPolicy(envMetadata: Environment): string {
    // Build policy statements for object-level permissions
    const statements = [];

    // TODO: Manage AuthZ with user UIDs (DS and environment creators) for assigning R/W privileges to the environment
    // For now, giving R/W access to all users

    const storageArnsWithPath = _.map(envMetadata.ENDPOINTS, (endpoint) => {
      const storageArn: string = endpoint.storageArn;
      const path: string = endpoint.path;
      return `${storageArn}/${path}/*`;
    });

    const endpointArnsWithPath = _.map(envMetadata.ENDPOINTS, (endpoint) => {
      const endpointArn = endpoint.endPointUrl.replace('s3://', '');
      return `${endpointArn}/object/${endpoint.path}/*`;
    });

    const endpointArns = _.map(envMetadata.ENDPOINTS, (endpoint) => {
      return endpoint.endPointUrl.replace('s3://', '');
    });
    const storageArns = _.map(envMetadata.ENDPOINTS, (endpoint) => {
      return endpoint.storageArn;
    });

    statements.push({
      Sid: 'DataSetReadWriteAccess',
      Effect: 'Allow',
      Action: [
        's3:GetObject',
        's3:AbortMultipartUpload',
        's3:ListMultipartUploadParts',
        's3:PutObject',
        's3:GetObjectAcl',
        's3:PutObjectAcl'
      ],
      Resource: _.union(storageArnsWithPath, endpointArnsWithPath)
    });

    statements.push({
      Sid: 'DataSetAccessPointAccess',
      Effect: 'Allow',
      Action: ['s3:GetAccessPoint', 's3:ListAccessPoints'],
      Resource: '*'
    });

    statements.push({
      Sid: 'DataSetListBucket',
      Effect: 'Allow',
      Action: 's3:ListBucket',
      Resource: _.union(storageArns, endpointArns)
    });

    statements.push({
      Sid: 'studyKMSAccess',
      Action: ['kms:Decrypt', 'kms:DescribeKey', 'kms:Encrypt', 'kms:GenerateDataKey', 'kms:ReEncrypt*'],
      Effect: 'Allow',
      Resource: envMetadata.PROJ.encryptionKeyArn
    });

    // Build final policyDoc
    const policyDoc = {
      Version: '2012-10-17',
      Statement: statements
    };

    return JSON.stringify(policyDoc);
  }

  public async getAwsSdkForEnvMgmtRole(payload: {
    envMgmtRoleArn: string;
    externalId?: string;
    operation: string;
    envType: string;
  }): Promise<AwsService> {
    console.log(`Assuming EnvMgmt role ${payload.envMgmtRoleArn} with externalId ${payload.externalId}`);
    const params = {
      roleArn: payload.envMgmtRoleArn,
      roleSessionName: `${payload.operation}-${payload.envType}-${Date.now()}`,
      region: process.env.AWS_REGION!,
      externalId: payload.externalId
    };

    const hostSdk = await this.aws.getAwsServiceForRole(params);

    return hostSdk;
  }
}
