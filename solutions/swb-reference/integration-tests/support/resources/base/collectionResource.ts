import { AxiosInstance } from 'axios';
import _ from 'lodash';
import ClientSession from '../../clientSession';
import Setup from '../../setup';
import Settings from '../../utils/settings';
import { doCall, sleep } from '../../utils/utilities';

export default class CollectionResource {
  protected _axiosInstance: AxiosInstance;
  protected _clientSession: ClientSession;
  protected _settings: Settings;
  protected _type: string;
  protected _childType: string;
  protected _parentApi: string;
  protected _api: string;
  // Specifies the delay duration in milliseconds needed to minimize the usage of stale data due to eventual
  // consistency.
  protected _deflakeDelayInMs: number = 2000;
  protected _setup: Setup;

  public constructor(clientSession: ClientSession, type: string, childType: string, parentApi: string = '') {
    this._setup = clientSession.getSetup();
    this._clientSession = clientSession;
    this._axiosInstance = clientSession.getAxiosInstance();
    this._settings = clientSession.getSettings();
    this._type = type;
    this._childType = childType;
    this._parentApi = parentApi;
    this._api = '';
  }

  // eslint-disable-next-line
  public async create(body: any = {}, applyDefault: boolean = true): Promise<any> {
    // Because of the cleanup logic, before we do the create, we need to ensure that the extender of this collection
    // resource class has a method that returns the resource operations helper for the child resource.
    // For example, if the extender class is 'Users' and it provides childType = 'user', then Users class must have
    // a method called 'user()'.
    // @ts-ignore
    if (!_.isFunction(this[this._childType])) {
      throw new Error(
        `The collection resource ['${this._type}'] must have a method named [${this._childType}()]`
      );
    }

    try {
      const requestBody = applyDefault ? this.defaults(body) : body;
      const resource = await doCall(async () => this._axiosInstance.post(this._api, requestBody));
      const id = resource.id;
      const taskId = `${this._childType}-${id}`;
      // @ts-ignore
      const resourceNode = this[this._childType](id);

      // We add a cleanup task to the cleanup queue for the session
      this._clientSession.addCleanupTask({ id: taskId, task: async () => resourceNode.cleanup() });

      await sleep(this._deflakeDelayInMs);
      return resource;
    } catch (error) {
      console.error(error);
      // throw transform(error);
    }
  }

  // Because this is a collection resource, the GET method returns an array of the instance child resources
  // eslint-disable-next-line
  public async get(queryParams: { [key: string]: string }): Promise<any[]> {
    return doCall(async () => this._axiosInstance.get(this._api, { params: queryParams }));
  }

  // This method should be overriden by the class extending `CollectionResource`
  // eslint-disable-next-line
  protected defaults(resource: any = {}): any {
    return resource;
  }
}
