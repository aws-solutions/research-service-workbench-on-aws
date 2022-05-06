import _ = require('lodash');
import EventBridgeEventToDDB from './eventBridgeEventToDDB';
import EnvironmentLifecycleHelper from './environmentLifecycleHelper';
import { StatusMap } from './statusMap';
import { AwsService } from '@amzn/workbench-core-base';

export default class StatusHandler {
  public async execute(event: EventBridgeEventToDDB): Promise<void> {
    console.log(`StatusHandler.execute processing event ${JSON.stringify(event)}`);

    const aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: process.env.STACK_NAME! });
    const envHelper = new EnvironmentLifecycleHelper();

    const envEntry = await aws.helpers.ddb
      .get({
        pk: { S: `ENV#${event.envId}` },
        sk: { S: `ENV#${event.envId}` }
      })
      .execute();
    const envDetails = 'Item' in envEntry ? envEntry.Item : undefined;

    // Check if this event is outdated
    const lastDDBUpdate = envDetails!.updatedAt!.S!;
    const eventBusTime = event.metadata.time;
    if (Date.parse(lastDDBUpdate) > Date.parse(eventBusTime)) {
      console.log('Event timestamp is older than the last update for this environment.');
      return;
    }

    envDetails!.status = { N: StatusMap[event.status] };

    // Update env status using data from event bridge
    await envHelper.storeToDdb(`ENV#${event.envId}`, `ENV#${event.envId}`, envDetails!);

    // The next few DDB updates are only needed during environment provisioning
    if (event.operation !== 'Launch') return;

    // Get hosting account SDK instance
    const hostSdk = await envHelper.getAwsSdkForEnvMgmtRole({
      accountId: envDetails!.accountId!.S!,
      operation: `StatusHandler-${event.operation}-${Date.now()}`,
      envType: event.metadata.detail.EnvType
    });

    // Get Instance ID and Instance ARN from RecordId provided in event metadata
    const { RecordOutputs } = await hostSdk.clients.serviceCatalog.describeRecord({
      Id: event.metadata.detail.RecordId
    });
    const instanceId = _.find(RecordOutputs, { OutputKey: 'NotebookInstanceName' })!.OutputValue!;
    const instanceArn = _.find(RecordOutputs, { OutputKey: 'NotebookArn' })!.OutputValue!;

    // We store the provisioned product ID sent in event metadata
    envDetails!.provisionedProductId = { S: event.metadata.detail.ProvisionedProductId };

    // We only update the provisioned product ID once right after the workspace becomes available
    await envHelper.storeToDdb(`ENV#${event.envId}`, `ENV#${event.envId}`, envDetails!);

    const envInstDetails = {
      id: { S: event.envId },
      instanceArn: { S: instanceArn }
    };

    // Create/update instance ID and ARN in DDB
    await envHelper.storeToDdb(`ENV#${event.envId}`, `INID#${instanceId}`, envInstDetails);

    const instDetails = {
      id: { S: instanceId },
      instanceArn: { S: instanceArn },
      resourceType: { S: 'instance' }
    };

    // Create/update corresponding instance resource in DDB
    await envHelper.storeToDdb(`INID#${instanceId}`, `ENV#${event.envId}`, instDetails);
  }
}
