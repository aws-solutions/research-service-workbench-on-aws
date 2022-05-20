import _ = require('lodash');
import EventBridgeEventToDDB from './eventBridgeEventToDDB';
import EnvironmentLifecycleHelper from './environmentLifecycleHelper';
import { isEnvironmentStatus } from './environmentStatus';
import EnvironmentService from './environmentService';
import envKeyNameToKey from './environmentKeyNameToKey';

export default class StatusHandler {
  public async execute(event: EventBridgeEventToDDB): Promise<void> {
    const envHelper = new EnvironmentLifecycleHelper();
    const envService = new EnvironmentService({TABLE_NAME: process.env.STACK_NAME!});
    const envDetails = await envService.getEnvironment(event.envId, true);

    // Check if this event is outdated
    const lastDDBUpdate = envDetails!.updatedAt;
    const eventBusTime = event.metadata.time;
    if (Date.parse(lastDDBUpdate) > Date.parse(eventBusTime)) {
      console.log('Event timestamp is older than the last update for this environment.');
      return;
    }

    if (!isEnvironmentStatus(event.status)) return;

    envDetails.status = event.status;

    // Update env status using data from event bridge
    await envService.updateEnvironment(event.envId, {status: event.status});

    // The next few DDB updates are only needed during environment provisioning
    if (event.operation !== 'Launch') {
      console.log(
        `This event was a ${event.operation} operation. Only Launch operations require a few more DDB updates.`
      );
      return;
    }

    // Get hosting account SDK instance
    const hostSdk = await envHelper.getAwsSdkForEnvMgmtRole({
      project: envDetails.PROJ,
      operation: `StatusHandler-${event.operation}`,
      envType: event.metadata.detail.EnvType
    });

    // Get Instance ID and Instance ARN from RecordId provided in event metadata
    const { RecordOutputs } = await hostSdk.clients.serviceCatalog.describeRecord({
      Id: event.metadata.detail.RecordId
    });
    const instanceName = _.find(RecordOutputs, { OutputKey: 'NotebookInstanceName' })!.OutputValue!;
    const instanceArn = _.find(RecordOutputs, { OutputKey: 'NotebookArn' })!.OutputValue!;

    // We store the provisioned product ID sent in event metadata
    // We only update the provisioned product ID once right after the workspace becomes available
    await envService.updateEnvironment(event.envId, { provisionedProductId: event.metadata.detail.ProvisionedProductId, instance: instanceName });

    const envInstDetails = {
      id: event.envId,
      instanceArn: instanceArn
    };

    // Create/update instance ID and ARN in DDB
    await envService.addMetadata(event.envId, envKeyNameToKey.environment, instanceName, envKeyNameToKey.instance, envInstDetails);

    const instDetails = {
      id: instanceName,
      instanceArn: instanceArn,
      resourceType: 'instance'
    };

    // Create/update corresponding instance resource in DDB
    await envService.addMetadata(instanceName, envKeyNameToKey.instance, event.envId, envKeyNameToKey.environment, instDetails);
  }
}
