'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const lodash_1 = __importDefault(require('lodash'));
class CollectionResource {
  constructor(clientSession, type, childType, parentApi = '') {
    this._setup = clientSession.getSetup();
    this._clientSession = clientSession;
    this._axiosInstance = clientSession.getAxiosInstance();
    this._settings = clientSession.getSettings();
    this._type = type;
    this._childType = childType;
    this._parentApi = parentApi;
    this._api = '';
  }
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(body = {}, applyDefault = true) {
    // Because of the cleanup logic, before we do the create, we need to ensure that the extender of this collection
    // resource class has a method that returns the resource operations helper for the child resource.
    // For example, if the extender class is 'Users' and it provides childType = 'user', then Users class must have
    // a method called 'user()'.
    // @ts-ignore
    if (!lodash_1.default.isFunction(this[this._childType])) {
      throw new Error(
        `The collection resource ['${this._type}'] must have a method named [${this._childType}()]`
      );
    }
    const requestBody = applyDefault ? this._buildDefaults(body) : body;
    const response = await this._axiosInstance.post(this._api, requestBody);
    const id = response.data.id;
    const taskId = `${this._childType}-${id}`;
    // @ts-ignore
    const resourceNode = this[this._childType](id);
    // We add a cleanup task to the cleanup queue for the session
    this._clientSession.addCleanupTask({ id: taskId, task: async () => resourceNode.cleanup() });
    return response;
  }
  // List call
  async get(queryParams) {
    return this._axiosInstance.get(this._api, { params: queryParams });
  }
  // This method should be overridden by the class extending `CollectionResource`
  // eslint-disable-next-line
  _buildDefaults(resource = {}) {
    return resource;
  }
}
exports.default = CollectionResource;
//# sourceMappingURL=collectionResource.js.map
