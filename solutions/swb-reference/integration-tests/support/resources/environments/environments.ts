import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
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

  protected _buildDefaults(resource: EnvironmentCreateRequest): EnvironmentCreateRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    return {
      description: resource.description ?? randomTextGenerator.getFakeText('fakeDescription'),
      name: resource.name ?? randomTextGenerator.getFakeText('fakeName'),
      envTypeId: resource.envTypeId ?? this._settings.get('envTypeId'),
      envTypeConfigId: resource.envTypeConfigId ?? this._settings.get('envTypeConfigId'),
      projectId: resource.projectId ?? this._settings.get('projectId'),
      datasetIds: resource.datasetIds ?? [],
      envType: resource.envType ?? this._settings.get('envType')
    };
  }
}

interface EnvironmentCreateRequest {
  description: string;
  name: string;
  envTypeId: string;
  envTypeConfigId: string;
  projectId: string;
  datasetIds: string[];
  envType: string;
}
