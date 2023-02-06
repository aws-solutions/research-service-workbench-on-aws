import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';

export default class AuditEntry extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'auditEntry', '', '/audit');
  }

  public async writeAuditEntry(
    auditEntry?: Record<string, string | number | object>
  ): Promise<AxiosResponse> {
    return await this._axiosInstance.post(`${this._parentApi}/write`, auditEntry);
  }

  public async isAuditEntryComplete(
    auditEntry?: Record<string, string | number | object>
  ): Promise<AxiosResponse> {
    return await this._axiosInstance.post(`${this._parentApi}/is-audit-complete`, auditEntry);
  }
}
