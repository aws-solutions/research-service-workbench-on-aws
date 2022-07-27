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
    this.ssmDocSuffix = process.env.SSM_DOC_OUTPUT_KEY_SUFFIX!;
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
   * Get multiple main account CFN stack outputs
   *
   * @returns output values retrieved from main CFN stack:
   *    datasetsBucketArn, mainAccountRegion, mainAccountId, mainAcctEncryptionArn
   */
  public async getCfnOutputs(): Promise<{ [id: string]: string }> {
    const cfService = this.aws.helpers.cloudformation;
    const {
      [process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!]: statusHandlerArn,
      [process.env.S3_DATASETS_BUCKET_ARN_OUTPUT_KEY!]: datasetsBucketArn,
      [process.env.MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!]: mainAcctEncryptionArn
    } = await cfService.getCfnOutput(process.env.STACK_NAME!, [
      process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!,
      process.env.S3_DATASETS_BUCKET_ARN_OUTPUT_KEY!,
      process.env.MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!
    ]);

    const mainAccountRegion = statusHandlerArn.split(':')[3];
    const mainAccountId = statusHandlerArn.split(':')[4];

    // We create these at deploy time so this will be present in the stack
    return { datasetsBucketArn, mainAccountRegion, mainAccountId, mainAcctEncryptionArn };
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
   * @param dataSetIds - the list of dataset IDs attached.
   * @param envMetadata - the environment on which to mount the dataset(s)
   * @param mainAcctEncryptionArn - the encryption key ARN for main account dataset bucket
   *
   * @returns an object containing:
   *  1. datasetsToMount - A string of a list of strigified mountString objects (curly brackets escaped for tsdoc):
   *     '["\{\"name\":\"testDs\",\"bucket\":\"s3://arn:aws:s3:us-east-1:<AcctID>:accesspoint/<randomStr>/\",\"prefix\":\"samplePath\",\"endpointId\":\"sampleEndpointId\"\}"]'
   *  2. Stringified IAM policy to be assigned to the workspace role
   */
  public async getDatasetsToMount(
    datasetIds: Array<string>,
    envMetadata: Environment,
    mainAcctEncryptionArn: string
  ): Promise<{ [id: string]: string }> {
    if (_.isEmpty(datasetIds)) return { s3Mounts: '[]', iamPolicyDocument: '{}' };

    const envId = envMetadata.id!;
    const endpointsCreated: { [key: string]: string }[] = [];

    const datasetsToMount = await Promise.all(
      _.map(datasetIds, async (datasetId) => {
        const datasetEndPointName = `${datasetId.slice(0, 13)}-mounted-on-${envId.slice(0, 13)}`;
        const mountObject = await this.dataSetService.addDataSetExternalEndpoint(
          datasetId,
          datasetEndPointName,
          new S3DataSetStoragePlugin(this.aws)
        );

        const dataSet = await this.dataSetService.getDataSet(datasetId);
        const endpoint = await this.dataSetService.getExternalEndPoint(datasetId, mountObject.endpointId);
        const endpointObj = {
          id: endpoint.id!,
          dataSetId: endpoint.dataSetId,
          endPointUrl: endpoint.endPointUrl,
          path: endpoint.path,
          storageArn: `arn:aws:s3:::${dataSet.storageName}` // TODO: Handle non-S3 storage types in future
        };

        await this.environmentService.addMetadata(
          envId,
          envResourceTypeToKey.environment,
          mountObject.endpointId,
          envResourceTypeToKey.endpoint,
          endpointObj
        );

        endpointsCreated.push(endpointObj);

        return JSON.stringify({
          name: mountObject.name,
          bucket: mountObject.bucket,
          prefix: mountObject.prefix
        });
      })
    );

    // Call IAM policy generator here, and return both strings
    const iamPolicyDocument = this.generateIamPolicy(
      endpointsCreated,
      envMetadata.PROJ.encryptionKeyArn,
      mainAcctEncryptionArn
    );
    const s3Mounts = JSON.stringify(datasetsToMount);

    return { s3Mounts, iamPolicyDocument };
  }

  /**
   * Get SSM document ARN from main account CFN stack outputs
   * @param ssmDocOutputName - SSM document CFN output name
   *
   * @returns SSM Document ARN
   */
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

  /**
   * Adds new environment role to external endpoint
   * @param envDetails - Environment object in DDB
   * @param instanceRoleArn - Environment instance role ARN
   */
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
   * @param endpointsCreated - the external endpoints created for this environment
   * @param encryptionKeyArn - the encryption key ARN for env data traffic
   * @param mainAcctEncryptionArn - the encryption key ARN for main account dataset bucket
   *
   * @returns iamPolicy - A stringified IAM policy
   */
  public generateIamPolicy(
    endpointsCreated: { [id: string]: string }[],
    encryptionKeyArn: string,
    mainAcctEncryptionArn: string
  ): string {
    // Build policy statements for object-level permissions
    const statements = [];

    // TODO: Manage AuthZ with user UIDs (DS and environment creators) for assigning R/W privileges to the environment
    // For now, giving R/W access to all users

    const storageArnsWithPath = _.map(endpointsCreated, (endpoint) => {
      const storageArn: string = endpoint.storageArn;
      const path: string = endpoint.path;
      return `${storageArn}/${path}/*`;
    });

    const endpointArnsWithPath = _.map(endpointsCreated, (endpoint) => {
      const endpointArn = endpoint.endPointUrl.replace('s3://', '');
      return `${endpointArn}/object/${endpoint.path}/*`;
    });

    const endpointArns = _.map(endpointsCreated, (endpoint) => {
      return endpoint.endPointUrl.replace('s3://', '');
    });
    const storageArns = _.map(endpointsCreated, (endpoint) => {
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
      Action: [
        'kms:CreateGrant',
        'kms:Get*',
        'kms:List*',
        'kms:Decrypt',
        'kms:DescribeKey',
        'kms:Encrypt',
        'kms:GenerateDataKey'
      ],
      Effect: 'Allow',
      Resource: [encryptionKeyArn, mainAcctEncryptionArn]
    });

    // Build final policyDoc
    const policyDoc = {
      Version: '2012-10-17',
      Statement: statements
    };

    return JSON.stringify(policyDoc);
  }

  /**
   * Get an AWS SDK instance in hosting account for EnvMgmt role
   * @param payload - Object containing role ARN to assume and other attributes required for role assumption
   *
   * @returns AWS SDK instance in hosting account
   */
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
