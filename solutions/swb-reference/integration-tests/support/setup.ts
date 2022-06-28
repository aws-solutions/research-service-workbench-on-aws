// TODO: Import this class from SWBv1

import _ from 'lodash';
import ClientSession from './clientSession';
import Settings from './utils/settings';

export default class Setup {
  private _settings: Settings;
  private _sessions: ClientSession[] = [];
  private _adminSession: ClientSession | undefined = undefined;

  public constructor() {
    // @ts-ignore
    this._settings = new Settings(global['__settings__']);

    // Retry failed tests up to three times
    jest.retryTimes(3);
  }

  public async createAnonymousSession(): Promise<ClientSession> {
    const session = await this._getClientSession();
    this._sessions.push(session);

    return session;
  }

  public async createAdminSession(): Promise<ClientSession> {
    // TODO: Authenticate and get actual Admin Session
    const session = await this._getClientSession();
    this._sessions.push(session);

    return session;
  }

  public async getDefaultAdminSession(): Promise<ClientSession> {
    // TODO: Handle token expiration
    if (this._adminSession === undefined) {
      this._adminSession = await this.createAdminSession();
    }
    return this._adminSession;
  }

  public async cleanup(): Promise<void> {
    // We need to reverse the order of the queue before we cleanup the sessions
    const sessions = _.reverse(_.slice(this._sessions));

    for (const session of sessions) {
      try {
        await session.cleanup();
      } catch (error) {
        console.error(error);
      }
    }

    this._sessions = []; // This way if the cleanup() method is called again, we don't need to cleanup again
  }

  public getSettings(): Settings {
    return this._settings;
  }

  // TODO: Implement once Auth is integrated in SWB
  // public async getDefaultAdmissionSession() : Promise<ClientSession>{}

  private async _getClientSession(idToken?: string): Promise<ClientSession> {
    const session = new ClientSession(this, idToken);
    await session.init();
    return session;
  }
}
