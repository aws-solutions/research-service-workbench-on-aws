import { AxiosInstance } from 'axios';
import { Resources } from './resources';
import Setup from './setup';
import Settings from './utils/settings';
export default class ClientSession {
  private _settings;
  private _cleanupQueue;
  private _isAnonymousSession;
  private _axiosInstance;
  private _setup;
  resources: Resources;
  constructor(setup: Setup, accessToken?: string);
  cleanup(): Promise<void>;
  addCleanupTask(cleanupTask: CleanupTask): void;
  removeCleanupTask(id: string): CleanupTask[];
  getAxiosInstance(): AxiosInstance;
  getSettings(): Settings;
  getSetup(): Setup;
}
interface CleanupTask {
  id: string;
  task: Function;
}
export {};
//# sourceMappingURL=clientSession.d.ts.map
