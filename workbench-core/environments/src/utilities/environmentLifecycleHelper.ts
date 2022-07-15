/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@amzn/workbench-core-audit';
import { AwsService, AuditLogger } from '@amzn/workbench-core-base';
import {
  DataSet,
  DataSetService,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin
} from '@amzn/workbench-core-datasets';
import { LoggingService } from '@amzn/workbench-core-logging';
import { Output } from '@aws-sdk/client-cloudformation';
import _ from 'lodash';
import { Environment } from '../services/environmentService';

export type Operation = 'Launch' | 'Terminate';

export default class EnvironmentLifecycleHelper {
  public aws: AwsService;
  public ssmDocSuffix: string;
  public dataSetService: DataSetService;
  public constructor() {
    this.ssmDocSuffix = process.env.SSM_DOC_NAME_SUFFIX!;
    this.aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: process.env.STACK_NAME! });
    const logger: LoggingService = new LoggingService();
    this.dataSetService = new DataSetService(
      new AuditService(new BaseAuditPlugin(new AuditLogger(logger))),
      logger,
      new DdbDataSetMetadataPlugin(this.aws, 'DATASET', 'ENDPOINT')
    );
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

  /**
   * Get the mount strings for all datasets attached to a given workspace.
   * @param dataSetIds - the list of datasets attached.
   * @param envId - the environment on which to mount the dataset(s)
   *
   * @returns datasetsToMount - A string of a list of strigified mountString objects (curly brackets escaped for tsdoc):
   * '["\{\"name\":\"testDs\",\"bucket\":\"s3://arn:aws:s3:us-east-1:<AcctID>:accesspoint/<randomStr>/\",\"prefix\":\"samplePath\"\}"]'
   */
  public async getDatasetsToMount(datasetIds: Array<string>, envId: string): Promise<string> {
    let datasetsToMount: Array<string> = [];

    datasetsToMount = await Promise.all(
      _.map(datasetIds, async (datasetId) => {
        const dataSet: DataSet = await this.dataSetService.getDataSet(datasetId);

        const datasetEndPointName = `${datasetId.slice(0, 13)}-mounted-on-${envId.slice(0, 13)}`;
        const mountString: string = _.isEmpty(dataSet.externalEndpoints)
          ? await this.dataSetService.addDataSetExternalEndpoint(
              datasetId,
              datasetEndPointName, // Need to take a subset of the uuid, because full uuid is too long
              new S3DataSetStoragePlugin(this.aws)
            )
          : await this.dataSetService.getDataSetMountString(datasetId, dataSet.externalEndpoints![0]);

        return mountString;
      })
    );

    return JSON.stringify(datasetsToMount);
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
      _.map(envDetails.datasetIds, async (datasetId) => {
        const dataSet: DataSet = await this.dataSetService.getDataSet(datasetId);
        // link instance role to dataset endpoint
        await this.dataSetService.addRoleToExternalEndpoint(
          datasetId,
          dataSet.externalEndpoints![0],
          instanceRoleArn,
          s3DataSetStoragePlugin
        );
      })
    );
  }

  /**
   * Get the workspace IAM policy for accessing all datasets attached.
   * @param dataSetIds - the list of datasets attached.
   * @param envId - the environment on which to mount the dataset(s)
   *
   * @returns iamPolicy - A stringified IAM policy
   */
  public async generateIamPolicy(datasetIds: Array<string>, envId: string): Promise<string> {
    const policyDoc = {};
    // // Build policy statements for object-level permissions
    // const statements = [];

    // // TODO: Manage AuthZ with user UIDs (DS and environment creators) for assigning R/W privileges to the environment
    // // For now, giving R/W access to all environments

    // if (datasetIds.length) {
    //   const writeableStudies = _.filter(datasetIds, dataset => dataset.writeable);
    //   const readonlyStudies = _.filter(datasetIds, dataset => !dataset.writeable);

    //   if (writeableStudies.length && writeableStudies.length > 0) {
    //     const objectLevelWriteActions = [
    //       's3:GetObject',
    //       's3:AbortMultipartUpload',
    //       's3:ListMultipartUploadParts',
    //       's3:PutObject',
    //       's3:PutObjectAcl',
    //       's3:DeleteObject',
    //     ];
    //     statements.push({
    //       Sid: readWriteStatementId,
    //       Effect: 'Allow',
    //       Action: objectLevelWriteActions,
    //       Resource: this._getObjectPathArns(writeableStudies),
    //     });
    //   }

    //   if (readonlyStudies.length && readonlyStudies.length > 0) {
    //     const objectLevelReadActions = ['s3:GetObject'];
    //     statements.push({
    //       Sid: readOnlyStatementId,
    //       Effect: 'Allow',
    //       Action: objectLevelReadActions,
    //       Resource: this._getObjectPathArns(readonlyStudies),
    //     });
    //   }

    //   // Create map of buckets whose paths need list access
    //   const bucketPaths = {};
    //   this._getObjectPathArns(studyInfo).forEach(arn => {
    //     const { bucket, prefix } = parseS3Arn(arn);
    //     if (!(bucket in bucketPaths)) {
    //       bucketPaths[bucket] = [];
    //     }
    //     bucketPaths[bucket].push(prefix);
    //   });

    //   // Add bucket list permissions to statements
    //   let bucketCtr = 1;
    //   Object.keys(bucketPaths).forEach(bucketName => {
    //     statements.push({
    //       Sid: `studyListS3Access${bucketCtr}`,
    //       Effect: 'Allow',
    //       Action: 's3:ListBucket',
    //       Resource: `arn:aws:s3:::${bucketName}`,
    //       Condition: {
    //         StringLike: {
    //           's3:prefix': bucketPaths[bucketName],
    //         },
    //       },
    //     });
    //     bucketCtr += 1;
    //   });

    //   // // Add KMS Permissions
    //   const studyDataKmsAliasArn = this.settings.get(settingKeys.studyDataKmsKeyArn);

    //   // Get KMS Key ARN from KMS Alias ARN
    //   // The "Decrypt","DescribeKey","GenerateDataKey" etc require KMS KEY ARN and not ALIAS ARN
    //   const [aws] = await this.service(['aws']);
    //   const kmsClient = new this.aws.clients.kms;
    //   const data = await kmsClient
    //     .describeKey({
    //       KeyId: studyDataKmsAliasArn,
    //     })
    //     .promise();
    //   const studyDataKmsKeyArn = data.KeyMetadata.Arn;
    //   statements.push({
    //     Sid: 'studyKMSAccess',
    //     Action: ['kms:Decrypt', 'kms:DescribeKey', 'kms:Encrypt', 'kms:GenerateDataKey', 'kms:ReEncrypt*'],
    //     Effect: 'Allow',
    //     Resource: studyDataKmsKeyArn,
    //   });

    //   // Build final policyDoc
    //   policyDoc = {
    //     Version: '2012-10-17',
    //     Statement: statements,
    //   };
    // }

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
