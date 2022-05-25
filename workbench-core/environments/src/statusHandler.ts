import _ = require('lodash');
import Boom from '@hapi/boom';
import EventBridgeEventToDDB from './eventBridgeEventToDDB';
import EnvironmentLifecycleHelper from './environmentLifecycleHelper';
import { isEnvironmentStatus } from './environmentStatus';
import EnvironmentService from './environmentService';
import envResourceTypeToKey from './environmentResourceTypeToKey';
import { AwsService } from '@amzn/workbench-core-base';

export default class StatusHandler {
  public async execute(event: EventBridgeEventToDDB): Promise<void> {
    const envHelper = new EnvironmentLifecycleHelper();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });

    if (_.isUndefined(event.envId) && _.isUndefined(event.metadata.detail.NotebookInstanceName)) {
      console.log('Neither Env ID nor Instance ID was provided. Skipping status update for this event');
      return;
    }

    let envId = event.envId;
    if (_.isUndefined(event.envId)) {
      const awsService = new AwsService({
        region: process.env.AWS_REGION!,
        ddbTableName: process.env.STACK_NAME!
      });
      const data = await awsService.helpers.ddb
        .query({
          key: {
            name: 'pk',
            value: `${envResourceTypeToKey.instance}#${event.metadata.detail.NotebookInstanceName}`
          }
        })
        .execute();
      if (data.Count === 0) {
        throw Boom.notFound(`Could not find instance ${event.metadata.detail.NotebookInstanceName}`);
      }

      const instance = data.Items![0];
      const instanceSk = instance.sk as unknown as string;
      envId = instanceSk.split(`${envResourceTypeToKey.environment}#`)[1];
    }

    // Check if this event is outdated
    const envDetails = await envService.getEnvironment(envId, true);
    const lastDDBUpdate = envDetails!.updatedAt;
    const eventBusTime = event.metadata.time;

    // We need to check if operation is Launch since SSM doc sends important details
    if (Date.parse(lastDDBUpdate) > Date.parse(eventBusTime) && event.operation !== 'Launch') {
      console.log('Latest status already applied. Skipping operation...');
      return;
    }

    if (!isEnvironmentStatus(event.status)) return;

    envDetails.status = event.status;

    // Update env status using data from event bridge
    await envService.updateEnvironment(envId, { status: event.status });

    // The next few DDB updates are only needed during environment provisioning
    if (event.operation !== 'Launch') {
      console.log(
        `This event was a ${event.operation} operation. Only Launch operations require a few more DDB updates.`
      );
      return;
    }

    // Get hosting account SDK instance
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
    const instanceName = _.find(RecordOutputs, { OutputKey: 'NotebookInstanceName' })!.OutputValue!;
    const instanceArn = _.find(RecordOutputs, { OutputKey: 'NotebookArn' })!.OutputValue!;

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
}
