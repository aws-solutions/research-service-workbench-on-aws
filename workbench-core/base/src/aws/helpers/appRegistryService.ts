/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CloudFormation } from '@aws-sdk/client-cloudformation';
import { ServiceCatalogAppRegistry } from '@aws-sdk/client-service-catalog-appregistry';
import { ServiceQuotas } from '@aws-sdk/client-service-quotas';

export default class AppRegistryService {
  private _appRegistry: ServiceCatalogAppRegistry;
  private _cloudFormation: CloudFormation;
  private _serviceQuotas: ServiceQuotas;

  public constructor(
    appRegistry: ServiceCatalogAppRegistry,
    cloudFormation: CloudFormation,
    serviceQuotas: ServiceQuotas
  ) {
    this._appRegistry = appRegistry;
    this._cloudFormation = cloudFormation;
    this._serviceQuotas = serviceQuotas;
  }
  /*
   * Associate stack resource to App registry Application
   */
  public async associateStackToAppRegistry(appRegistryName: string, stackName: string): Promise<void> {
    try {
      console.log(`Associating Stack: ${stackName} to App Registry: ${appRegistryName}`);
      const applicationDetails = await this._appRegistry.getApplication({ application: appRegistryName });
      const stackDetails = await this._cloudFormation.describeStacks({ StackName: stackName });
      const stackFound = stackDetails.Stacks![0];
      const applicationId = applicationDetails.id;
      console.log(`Associating Stack: ${stackFound.StackId} to App Registry: ${applicationId}`);
      console.log(`Associated Resource Count: ${applicationDetails.associatedResourceCount}`);
      const appRegistrationQuota = await this._serviceQuotas.getServiceQuota({
        ServiceCode: 'servicecatalog',
        QuotaCode: 'L-360CDF2E'
      }); //service catalog app registry resource count
      const resourceLimit = appRegistrationQuota.Quota!.Value!;
      console.log(`Resource Limit: ${resourceLimit}`);
      if (applicationDetails.associatedResourceCount! + 1 > resourceLimit) {
        throw new Error('App Registry Limit has been reached');
      }

      await this._appRegistry.associateResource({
        application: applicationId,
        resourceType: 'CFN_STACK',
        resource: stackFound.StackId
      }); //if resource is already associated, a conflict exception will throw
    } catch (e) {
      console.error(
        `Could not associate resource: [${stackName}] to application: [${appRegistryName}] - ${e.message}`
      ); //catch all exceptions to avoid blocking users from creating workspaces
    }
  }

  /*
   * Disssociate stack resource to App registry Application
   */
  public async disassociateStackToAppRegistry(appRegistryName: string, stackName: string): Promise<void> {
    try {
      console.log(`Disassociating Stack: ${stackName} to App Registry: ${appRegistryName}`);
      const applicationDetails = await this._appRegistry.getApplication({ application: appRegistryName });
      const stackDetails = await this._cloudFormation.describeStacks({ StackName: stackName });
      const stackFound = stackDetails.Stacks![0];
      const applicationId = applicationDetails.id;
      console.log(`Disassociating Stack: ${stackFound.StackId} to App Registry: ${applicationId}`);
      console.log(`Associated Resource Count: ${applicationDetails.associatedResourceCount}`);

      await this._appRegistry.disassociateResource({
        application: applicationId,
        resourceType: 'CFN_STACK',
        resource: stackFound.StackId
      }); //if resource is not associated, a exception will throw
    } catch (e) {
      console.error(
        `Could not disassociate resource: [${stackName}] to application: [${appRegistryName}] - ${e.message}`
      ); //catch all exceptions to avoid blocking users from terminating workspaces
    }
  }
}
