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
   * Get the mount strings for all datasets attached to a given workspace.
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
   * @returns a stringified list of objects containing dataset's name, storageName, path and mountString
   */
  public async getDatasetsToMount(datasetIds: Array<string>, envId: string): Promise<string> {
    let datasetsToMount: Array<{ [key: string]: string }> = [];

    datasetsToMount = await Promise.all(
      _.map(datasetIds, async (datasetId) => {
        const dataSet: DataSet = await this.dataSetService.getDataSet(datasetId);

        const mountString: string = _.isEmpty(dataSet.externalEndpoints)
          ? await this.dataSetService.addDataSetExternalEndpoint(
              datasetId,
              `${datasetId}-mounted-on-${envId}`,
              new S3DataSetStoragePlugin(this.aws)
            )
          : await this.dataSetService.getDataSetMountString(datasetId, `${datasetId}-mounted-on-${envId}`);

        return {
          datasetId,
          storageName: dataSet.storageName,
          path: dataSet.path,
          mountString
        };
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
