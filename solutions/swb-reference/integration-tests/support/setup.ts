// TODO: Import this class from SWBv1

import _ from 'lodash';
import ClientSession from './clientSession';
import Settings from './utils/settings';

export default class Setup {
  public settings: Settings;
  private _sessions: ClientSession[] = [];

  public constructor() {
    // @ts-ignore
    this.settings = new Settings(global['__settings__']);

    // Retry failed tests up to three times
    jest.retryTimes(3);
  }

  public async createAnonymousSession(): Promise<ClientSession> {
    const session = await this._getClientSession(this.settings);
    this._sessions.push(session);

    return session;
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

  // TODO: Implement once Auth is integrated in SWB
  // public async getDefaultAdmissionSession() : Promise<ClientSession>{}

  private async _getClientSession(settings: Settings, idToken?: string): Promise<ClientSession> {
    const session = new ClientSession(settings, idToken);
    await session.init();
    return session;
  }
}
