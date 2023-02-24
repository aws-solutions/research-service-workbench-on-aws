/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DatasetHelper } from '../../complex/datasetHelper';
import Resource from '../base/resource';

export default class Dataset extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'dataset', id, parentApi);
  }

  public async share(requestBody: { [id: string]: string }): Promise<AxiosResponse> {
    return this._axiosInstance.post(`${this._api}/share`, requestBody);
  }

  public async associateWithProject(
    projectId: string,
    accessLevel: 'read-only' | 'read-write'
  ): Promise<AxiosResponse> {
    return this._axiosInstance.put(`/projects/${projectId}/datasets/${this._id}/relationships`, {
      accessLevel
    });
  }

  public async softDelete(): Promise<AxiosResponse> {
    return this._axiosInstance.delete(`${this._api}/softDelete`);
  }

  public async deleteFromProject(projectId: string): Promise<void> {
    return this._axiosInstance.delete(`/projects/${projectId}/datasets/${this._id}`);
  }

  public async disassociateFromProject(projectId: string): Promise<AxiosResponse> {
    return this._axiosInstance.delete(`${this._api}/relationships`);
  }

  public async listAccessPermissions(): Promise<AxiosResponse> {
    return this._axiosInstance.get(`/datasets/${this._id}/permissions`);
  }
  public async getFileUploadUrls(filenames?: string | string[]): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/upload-requests`, { params: { filenames } });
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const { data: resource } = await defAdminSession.resources.datasets.dataset(this._id).get();
    const { storageName, path } = resource;

    // Delete DDB entries, and path folder from bucket (to prevent test resources polluting a prod env)
    const datasetHelper = new DatasetHelper();
    await datasetHelper.deleteS3Resources(storageName, path);
    await datasetHelper.deleteDdbRecords(this._id);
  }
}
