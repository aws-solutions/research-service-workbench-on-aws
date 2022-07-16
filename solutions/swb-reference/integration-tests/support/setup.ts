// TODO: Import this class from SWBv1

import _ from 'lodash';
import ClientSession from './clientSession';
import Settings from './utils/settings';

export default class Setup {
  private _settings: Settings;
  private _sessions: ClientSession[] = [];
  private _defaultAdminSession: ClientSession | undefined = undefined;

  public constructor() {
    // @ts-ignore
    this._settings = new Settings(global['__settings__']);

    // Let's not setup test retries until we find that we actually need it
    jest.retryTimes(0);
  }

  public async createAnonymousSession(): Promise<ClientSession> {
    const session = this._getClientSession();
    this._sessions.push(session);

    return session;
  }

  public async createAdminSession(): Promise<ClientSession> {
    // TODO: Authenticate and get actual Admin Session
    const session = this._getClientSession();
    this._sessions.push(session);

    return session;
  }

  public async getDefaultAdminSession(): Promise<ClientSession> {
    // TODO: Handle token expiration and getting defaultAdminSession instead of creating a new Admin Session
    if (this._defaultAdminSession === undefined) {
      this._defaultAdminSession = await this.createAdminSession();
    }
    return this._defaultAdminSession;
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

  private _getClientSession(idToken?: string): ClientSession {
    return new ClientSession(this, idToken);
  }
}
