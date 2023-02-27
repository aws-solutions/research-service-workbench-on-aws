import { AwsService } from '@aws/workbench-core-base';
import { EnvironmentTypeService, EnvironmentType } from '@aws/workbench-core-environments';
import Setup from '../setup';
import RandomTextGenerator from '../utils/randomTextGenerator';
import Settings from '../utils/settings';

export class EnvironmentTypeHelper {
  private _awsSdk: AwsService;
  private _settings: Settings;
  private _environmentTypeService: EnvironmentTypeService;
  public constructor() {
    const setup = Setup.getSetup();
    this._awsSdk = setup.getMainAwsClient();
    this._settings = setup.getSettings();
    this._environmentTypeService = new EnvironmentTypeService(this._awsSdk.helpers.ddb);
  }

  public async createEnvironmentType(
    productId: string,
    provisioningArtifactId: string
  ): Promise<EnvironmentType> {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    return this._environmentTypeService.createNewEnvironmentType({
      description: randomTextGenerator.getFakeText('fakeDescription'),
      name: randomTextGenerator.getFakeText('fakeName'),
      params: {},
      productId,
      provisioningArtifactId,
      status: 'NOT_APPROVED',
      type: randomTextGenerator.getFakeText('fakeType')
    });
  }

  public async deleteEnvironmentType(envTypeId: string): Promise<void> {
    await this._awsSdk.helpers.ddb.delete({ pk: `ET#${envTypeId}`, sk: `ET#${envTypeId}` }).execute();
  }
}
