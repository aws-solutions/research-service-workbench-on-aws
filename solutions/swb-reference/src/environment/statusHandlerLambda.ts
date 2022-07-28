/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */
import { StatusHandler, EventBridgeEventToDDB } from '@amzn/workbench-core-environments';
import _ from 'lodash';

/* eslint-disable-next-line */
export async function handler(event: any) {
  console.log(`StatusHandler processing event ${JSON.stringify(event)}`);

  // Various environment types indicate status in unique locations of their event detail
  // This is to standardize each of them
  const statusLocation: { [id: string]: string } = {
    // This is the source used by SSM automation docs to launch/terminate environments
    automation: 'Status',

    sagemaker: 'NotebookInstanceStatus'
    // Add your new env types here
  };

  // Environment types could use different terminologies for their instance names (what we use for "INID#<instanceId>")
  // This is to standardize each of them
  const instanceIdLocation: { [id: string]: string } = {
    sagemaker: 'NotebookInstanceName'

    // Add your new env types here
  };

  // Various environment types indicate instance names and ARNs differently in ServiceCatalog record outputs
  // This is to standardize each of them
  const envTypeRecordOutputKeys: { [id: string]: { [id: string]: string } } = {
    // This is the `envType` defined in the "LaunchSSM.yaml" SSM document
    sagemakerNotebook: {
      instanceNameRecordKey: 'NotebookInstanceName',
      instanceArnRecordKey: 'NotebookArn',
      instanceRoleName: 'EnvironmentInstanceRoleArn'
    }

    // Add your new env types here
  };

  // Some env types use different terminologies for statuses
  const alternateStatuses: { [id: string]: { [id: string]: string } } = {
    sagemaker: {
      InService: 'COMPLETED',
      Deleting: 'TERMINATING',
      Deleted: 'TERMINATED'
    }
    // Add your new env alternate statuses here
  };

  const source = event.source === 'automation' ? 'automation' : event.source.split('aws.')[1];
  if (!_.includes(Object.keys(statusLocation), source)) {
    console.log('The source for this event is not recognized by Status Handler. Skipping operation...');
    return;
  }

  const recordOutputKeys = { instanceName: '', instanceArn: '', instanceRoleName: '' };
  let instanceId;
  let status;
  status = _.get(event.detail, statusLocation[source]);

  if (source === 'automation') {
    // For when events arise from launch/terminate operations (SSM docs)
    const envType = event.detail.EnvType;
    recordOutputKeys.instanceName = envTypeRecordOutputKeys[envType].instanceNameRecordKey;
    recordOutputKeys.instanceArn = envTypeRecordOutputKeys[envType].instanceArnRecordKey;
    recordOutputKeys.instanceRoleName = envTypeRecordOutputKeys[envType].instanceRoleName;
  } else {
    // For when events arise from start/stop operations (not from SSM docs)
    if (_.includes(Object.keys(alternateStatuses[source]), status))
      status = alternateStatuses[source][status];
    instanceId = _.get(event.detail, instanceIdLocation[source]);
  }

  // Map event to EventBridgeEventToDDB
  const ebToDDB: EventBridgeEventToDDB = {
    envId: event.detail.EnvId || event.detail.Tags?.Env,
    instanceId,
    recordOutputKeys,
    status: status?.toUpperCase(),
    // TODO: This propagates error messages (if any) for launch/terminate failure events. Add logic for propagating start/stop failure event messages
    errorMsg: _.isObject(event.detail.ErrorMessage)
      ? JSON.stringify(event.detail.ErrorMessage)
      : event.detail.ErrorMessage,
    operation: event.detail.Operation,
    metadata: event
  };

  const statusHandler = new StatusHandler();
  await statusHandler.execute(ebToDDB);
}
