import axios, { AxiosInstance } from 'axios';
import _ from 'lodash';
import { getResources, Resources } from './resources';
import Setup from './setup';
import Settings from './utils/settings';

export default class ClientSession {
  private _settings: Settings;
  private _cleanupQueue: CleanupTask[];
  private _isAnonymousSession: boolean;
  private _axiosInstance: AxiosInstance;
  public resources: Resources;
  private _setup: Setup;

  public constructor(setup: Setup, idToken?: string) {
    this._settings = setup.getSettings();
    this._setup = setup;
    this._isAnonymousSession = idToken === undefined;
    // Each element is an object (cleanupTask) of shape { id, command = async fn() }
    this._cleanupQueue = [];

    const headers: {
      'Content-Type': string;
      Authorization?: string;
    } = { 'Content-Type': 'application/json' };

    // For anonymous sessions, authorization header is not required
    if (!this._isAnonymousSession) {
      headers.Authorization = idToken;
    }

    this._axiosInstance = axios.create({
      baseURL: this._settings.get('apiBaseUrl'),
      timeout: 30000, // 30 seconds to mimic API gateway timeout
      headers
    });
    this.resources = getResources(this);
  }

  public async init(): Promise<void> {
    // Load the user associated with this idToken unless it is an anonymous session
    if (this._isAnonymousSession) return;

    // TODO: Implement this once auth is added
    // this.user = await this.resources.currentUser.get();
  }

  public async cleanup(): Promise<void> {
    // We need to reverse the order of the queue before we execute the cleanup tasks
    const items = _.reverse(_.slice(this._cleanupQueue));

    for (const { task } of items) {
      try {
        await task();
      } catch (error) {
        console.error(error);
      }
    }

    this._cleanupQueue = []; // This way if the cleanup() method is called again, we don't need to cleanup again
  }

  // This is used by the Resource and CollectionResource base classes. You rarely need to use this method unless you
  // want to add your explicit cleanup task
  // @param {object} cleanupTask an object of shape { id, command = async fn() }
  public addCleanupTask(cleanupTask: CleanupTask): void {
    this._cleanupQueue.push(cleanupTask);
  }

  // Given the id of the cleanup task, remove it from the cleanup queue. If there is more than one task with the same
  // id in the queue, all of the tasks with the matching id will be removed.
  public removeCleanupTask(id: string): CleanupTask[] {
    return _.remove(this._cleanupQueue, ['id', id]);
  }

  public getAxiosInstance(): AxiosInstance {
    return this._axiosInstance;
  }

  public getSettings(): Settings {
    return this._settings;
  }

  public getSetup(): Setup {
    return this._setup;
  }
}

interface CleanupTask {
  id: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  task: Function;
}
