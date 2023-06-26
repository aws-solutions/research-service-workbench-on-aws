/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, DynamoDBService, resourceTypeToKey } from '@aws/workbench-core-base';
import * as Boom from '@hapi/boom';
import _ from 'lodash';
import { isEnvironmentStatus } from '../constants/environmentStatus';
import EventBridgeEventToDDB from '../models/eventBridgeEventToDDB';
import { EnvironmentService } from '../services/environmentService';
import EnvironmentLifecycleHelper from '../utilities/environmentLifecycleHelper';

export default class StatusHandler {
  public async execute(event: EventBridgeEventToDDB): Promise<void> {
    if (_.isUndefined(event.envId) && _.isUndefined(event.instanceId)) {
      console.log('Neither Env ID nor Instance ID was provided. Skipping status update.');
      return;
    }

    if (!isEnvironmentStatus(event.status)) {
      console.log(
        `Event status ${event.status} is not a recognized Environment Status. Skipping status update.`
      );
      return;
    }

    const envService = this._getEnvService();

    // Check if this event is outdated
    const envId = event.envId ? event.envId : await this._getEnvId(event.instanceId!);
    const envDetails = await envService.getEnvironment(envId, true);
    const lastDDBUpdate = envDetails!.updatedAt;
    const eventBusTime = event.metadata.time;

    const envStackName = `SC-${event.metadata.account}-${
      event.metadata.detail.ProvisionedProductId || envDetails.provisionedProductId
    }`;
    const appRegistryName = `${process.env.STACK_NAME}-hosting-account-RSWAppReg-${event.metadata.account}`;

    // Check if status already applied, or if this is an outdated event, or if instanceId has not been updated for the env.
    // We need to wait for "Launch" event to propagate `instanceId` value in DDB before environment status can be updated
    // Perform status update regardless if operation is "Launch" since SSM doc sends important details
    if (
      (Date.parse(lastDDBUpdate) > Date.parse(eventBusTime) ||
        envDetails.status === event.status ||
        envDetails.instanceId === '') &&
      event.operation !== 'Launch'
    ) {
      console.log('Latest status already applied. Skipping status update.');
      return;
    }

    // Get hosting account SDK instance
    const envHelper = this._getEnvHelper();
    const hostSdk = await envHelper.getAwsSdkForEnvMgmtRole({
      envMgmtRoleArn: envDetails.PROJ!.envMgmtRoleArn,
      externalId: envDetails.PROJ!.externalId,
      operation: `StatusHandler-${event.operation}`,
      envType: event.metadata.detail.EnvType
    });

    const updateRequest: { status: string; error?: { type: string; value: string }; resourceType?: string } =
      {
        status: event.status
      };
    if (event.status === 'TERMINATED') {
      updateRequest.resourceType = 'terminated_environment';
      await hostSdk.helpers.appRegistryService.disassociateStackToAppRegistry(appRegistryName, envStackName);
    }
    if (event.errorMsg) {
      updateRequest.error = {
        // We use event.operation for Launch/Terminate SSM doc events
        // (for future) and event.status for automatic status update events (STARTING/STOPPING etc.)
        type: event.operation?.toUpperCase() || event.status,
        value: event.errorMsg!
      };
    }

    // Update env status using data from event bridge
    await envService.updateEnvironment(envId, updateRequest);

    // The next few DDB updates are only needed during environment provisioning
    if (event.operation !== 'Launch') {
      console.log(
        `This event was a ${event.operation} operation. Only Launch operations require a few more DDB updates.`
      );
      return;
    }

    // Get Instance ID and Instance ARN from RecordId provided in event metadata
    const { RecordOutputs } = await hostSdk.clients.serviceCatalog.describeRecord({
      Id: event.metadata.detail.RecordId
    });
    const instanceName = _.find(RecordOutputs, { OutputKey: event.recordOutputKeys!.instanceName })!
      .OutputValue!;
    const instanceArn = _.find(RecordOutputs, { OutputKey: event.recordOutputKeys!.instanceArn })!
      .OutputValue!;
    const instanceRoleArn = _.find(RecordOutputs, { OutputKey: event.recordOutputKeys!.instanceRoleName })!
      .OutputValue!;
    await envHelper.addRoleToAccessPoint(envDetails, instanceRoleArn);

    // We store the provisioned product ID sent in event metadata
    // We only update the provisioned product ID once right after the workspace becomes available
    await envService.updateEnvironment(envId, {
      provisionedProductId: event.metadata.detail.ProvisionedProductId,
      instanceId: instanceName
    });

    const envInstDetails = {
      id: envId,
      instanceArn: instanceArn
    };

    // Create/update instance ID and ARN in DDB
    await envService.addMetadata(
      envId,
      resourceTypeToKey.environment,
      instanceName,
      resourceTypeToKey.instance,
      envInstDetails
    );

    const instDetails = {
      id: instanceName,
      instanceArn: instanceArn,
      resourceType: 'instance'
    };

    // Create/update corresponding instance resource in DDB
    await envService.addMetadata(
      instanceName,
      resourceTypeToKey.instance,
      envId,
      resourceTypeToKey.environment,
      instDetails
    );

    await hostSdk.helpers.appRegistryService.associateStackToAppRegistry(appRegistryName, envStackName);
  }

  /** Get environment ID from DDB for given instance ID
   * @param instanceId - Environment instance name stored in DDB
   * @returns environment ID in DDB from sort key
   */
  private async _getEnvId(instanceId: string): Promise<string> {
    const awsService = new AwsService({
      region: process.env.AWS_REGION!,
      ddbTableName: process.env.STACK_NAME!
    });
    const data = await awsService.helpers.ddb
      .query({
        key: {
          name: 'pk',
          value: `${resourceTypeToKey.instance}#${instanceId}`
        }
      })
      .execute();
    if (data.Count === 0) {
      throw Boom.notFound(`Could not find instance`);
    }

    const instance = data.Items![0];
    const instanceSk = instance.sk as unknown as string;
    return instanceSk.split(`${resourceTypeToKey.environment}#`)[1];
  }

  /** Get environment service instance
   * @returns EnvironmentService instance
   */
  private _getEnvService(): EnvironmentService {
    const dynamoDBService = new DynamoDBService({
      region: process.env.AWS_REGION!,
      table: process.env.STACK_NAME!
    });
    return new EnvironmentService(dynamoDBService);
  }

  /** Get environment helper instance
   * @returns EnvironmentLifecycleHelper instance
   */
  private _getEnvHelper(): EnvironmentLifecycleHelper {
    return new EnvironmentLifecycleHelper();
  }
}
