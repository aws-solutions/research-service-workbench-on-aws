import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import Environment from './environment';

export default class Environments extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'environments', 'environment');
    this._api = 'environments';
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public environment(id: string): Environment {
    return new Environment(id, this._clientSession, this._api);
  }

  protected _buildDefaults(resource: any = {}): any {
    return {
      description: resource.description ?? 'test 123',
      name: 'testEnv1',
      envTypeId: this._settings.get('envTypeId'),
      envTypeConfigId: this._settings.get('envTypeConfigId'),
      projectId: this._settings.get('projectId'),
      datasetIds: [],
      envType: this._settings.get('envType')
    };
  }
}
