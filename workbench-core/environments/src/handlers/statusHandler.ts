/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import Boom from '@hapi/boom';
import _ from 'lodash';
import envResourceTypeToKey from '../constants/environmentResourceTypeToKey';
import { isEnvironmentStatus } from '../constants/environmentStatus';
import EventBridgeEventToDDB from '../interfaces/eventBridgeEventToDDB';
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

    const updateRequest: { status: string; error?: { type: string; value: string }; resourceType?: string } =
      {
        status: event.status
      };
    if (event.status === 'TERMINATED') {
      updateRequest.resourceType = 'terminated_environment';
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

    // Get hosting account SDK instance
    const envHelper = this._getEnvHelper();
    const hostSdk = await envHelper.getAwsSdkForEnvMgmtRole({
      envMgmtRoleArn: envDetails.PROJ.envMgmtRoleArn,
      externalId: envDetails.PROJ.externalId,
      operation: `StatusHandler-${event.operation}`,
      envType: event.metadata.detail.EnvType
    });

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
      envResourceTypeToKey.environment,
      instanceName,
      envResourceTypeToKey.instance,
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
      envResourceTypeToKey.instance,
      envId,
      envResourceTypeToKey.environment,
      instDetails
    );
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
          value: `${envResourceTypeToKey.instance}#${instanceId}`
        }
      })
      .execute();
    if (data.Count === 0) {
      throw Boom.notFound(`Could not find instance ${instanceId}`);
    }

    const instance = data.Items![0];
    const instanceSk = instance.sk as unknown as string;
    return instanceSk.split(`${envResourceTypeToKey.environment}#`)[1];
  }

  /** Get environment service instance
   * @returns EnvironmentService instance
   */
  private _getEnvService(): EnvironmentService {
    return new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
  }

  /** Get environment helper instance
   * @returns EnvironmentLifecycleHelper instance
   */
  private _getEnvHelper(): EnvironmentLifecycleHelper {
    return new EnvironmentLifecycleHelper();
  }
}
