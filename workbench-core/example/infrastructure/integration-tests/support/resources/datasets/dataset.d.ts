import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Resource from '../base/resource';
export default class Dataset extends Resource {
  constructor(id: string, clientSession: ClientSession, parentApi: string);
  share(requestBody: { [id: string]: string }): Promise<AxiosResponse>;
  protected cleanup(): Promise<void>;
}
//# sourceMappingURL=dataset.d.ts.map
