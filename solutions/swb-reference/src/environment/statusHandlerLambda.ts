/* eslint-disable security/detect-object-injection */
import _ = require('lodash');
import { StatusHandler, EventBridgeEventToDDB } from '@amzn/environments';

/* eslint-disable-next-line */
export async function handler(event: any) {
  // TODO: Allow user-configurability of object attributes to be stored to DDB
  console.log(`StatusHandler processing event ${JSON.stringify(event)}`);

  // Various environment types indicate status in unique locations of their event detail
  // This is to standardize each of them
  const statusLocation: { [id: string]: string } = {
    // This is the source used by SSM automation docs to launch/terminate environments
    automation: 'Status',

    // Add your new env types here
    sagemaker: 'NotebookInstanceStatus'
  };

  // Some env types use different terminologies for statuses
  const alternateStatuses: { [id: string]: string } = {
    // Sagemaker statuses : ENVIRONMENT_STATUS
    InService: 'COMPLETED',
    Deleting: 'TERMINATING',
    Deleted: 'TERMINATED'
  };

  const source = event.source === 'automation' ? 'automation' : event.source.split('aws.')[1];
  if (!_.includes(Object.keys(statusLocation), source)) {
    console.log('The source for this event is not recognized by Status Handler. Skipping operation...');
    return;
  }

  let status = _.get(event.detail, statusLocation[source]);
  if (_.includes(Object.keys(alternateStatuses), status)) status = alternateStatuses[status];

  // Map event to EventBridgeEventToDDB
  const ebToDDB: EventBridgeEventToDDB = {
    envId: event.detail.EnvId,
    status: status.toUpperCase(),
    operation: event.detail.Operation,
    metadata: event
  };

  const statusHandler = new StatusHandler();
  await statusHandler.execute(ebToDDB);
}
