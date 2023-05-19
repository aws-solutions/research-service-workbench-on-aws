import { AwsService } from '@aws/workbench-core-base';
import { EnvironmentService } from '@aws/workbench-core-environments';
import Setup from '../setup';

export class EnvironmentHelper {
  private _awsSdk: AwsService;
  private _environmentService: EnvironmentService;
  public constructor() {
    const setup = Setup.getSetup();
    this._awsSdk = setup.getMainAwsClient();
    this._environmentService = new EnvironmentService(this._awsSdk.helpers.ddb);
  }

  public async updateEnvironment(envId: string, newStatus: string): Promise<void> {
    const updatedValues = {
      status: newStatus
    };

    await this._environmentService.updateEnvironment(envId, updatedValues);
  }
}
