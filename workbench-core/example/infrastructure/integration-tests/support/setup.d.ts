import { AwsService } from '@aws/workbench-core-base';
import ClientSession from './clientSession';
import Settings from './utils/settings';
export default class Setup {
  private _settings;
  private _sessions;
  private _defaultAdminSession;
  constructor();
  createAnonymousSession(): Promise<ClientSession>;
  createAdminSession(): Promise<ClientSession>;
  getDefaultAdminSession(): Promise<ClientSession>;
  getStackName(): string;
  getMainAwsClient(): AwsService;
  cleanup(): Promise<void>;
  getSettings(): Settings;
  private _getClientSession;
}
//# sourceMappingURL=setup.d.ts.map
