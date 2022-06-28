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
}
