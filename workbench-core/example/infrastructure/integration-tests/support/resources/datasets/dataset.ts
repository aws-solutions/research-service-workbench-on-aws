/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { IdentityPermission as Permission, IdentityType } from '@aws/workbench-core-authorization';
import { validateAndParse } from '@aws/workbench-core-base';
import {
  DataSetPermission,
  PermissionsResponse,
  PermissionsResponseParser
} from '@aws/workbench-core-datasets';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DatasetHelper } from '../../complex/datasetHelper';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import Resource from '../base/resource';
import IdentityPermission from '../dynamicAuthorization/identityPermission';
import Endpoint, { EndpointCreateParams } from './endpoint';

export default class Dataset extends Resource {
  private _awsAccountId: string;
  private _children: Map<string, Endpoint>;
  private _permissions: Map<string, IdentityPermission>;
  private _clientSession: ClientSession;
  public storageName: string;
  public storagePath: string;

  public constructor(params: DataSetCreateParams) {
    super(params.clientSession, 'dataset', params.id, params.parentApi);
    this._awsAccountId = params.awsAccountId;
    this.storageName = params.storageName;
    this.storagePath = params.storagePath;
    this._clientSession = params.clientSession;
    this._children = new Map<string, Endpoint>();
    this._permissions = new Map<string, IdentityPermission>();
  }

  public identityPermission(
    identityPermission: Permission,
    clientSession: ClientSession,
    parentApi: string,
    id: string
  ): IdentityPermission {
    return new IdentityPermission(identityPermission, clientSession, parentApi, id);
  }

  public endpoint(params: EndpointCreateParams): Endpoint {
    return new Endpoint(params);
  }

  public async getAllAccess(): Promise<PermissionsResponse> {
    const response: AxiosResponse = await this._axiosInstance.get(`${this._api}/permissions`);
    return validateAndParse(PermissionsResponseParser, response.data);
  }

  public async getAccess(identityType: IdentityType, identity: string): Promise<PermissionsResponse> {
    let routeId: string;
    if (identityType === 'GROUP') {
      routeId = 'roles';
    } else if (identityType === 'USER') {
      routeId = 'users';
    } else {
      throw new Error('identity type must be "USER" or "GROUP"');
    }
    const response: AxiosResponse = await this._axiosInstance.get(
      `${this._api}/permissions/${routeId}/${identity}`
    );
    return validateAndParse(PermissionsResponseParser, response.data);
  }

  public generateDataSetPermissions(permissionObjects: DataSetPermission[]): void {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    const permissions: Permission[] = permissionObjects.map((p: DataSetPermission) => {
      return {
        action: p.accessLevel === 'read-only' ? 'READ' : 'UPDATE',
        effect: 'ALLOW',
        subjectType: 'DataSet',
        subjectId: this.id,
        identityType: p.identityType === 'GROUP' ? 'GROUP' : 'USER',
        identityId: p.identity
      };
    });

    permissions.map((p) => {
      const taskId = `dataset-permission-${randomTextGenerator.getFakeText('test-perm').toLowerCase()}`;
      const resourceNode: IdentityPermission = this.identityPermission(p, this._clientSession, '', taskId);
      this._permissions.set(resourceNode.id, resourceNode);
      this._clientSession.addCleanupTask({ id: taskId, task: async () => resourceNode.cleanup() });
    });
  }

  public async addAccess(requestBody: Record<string, unknown>): Promise<PermissionsResponse> {
    const response: AxiosResponse = await this._axiosInstance.post(`${this._api}/permissions`, requestBody);
    const permissionsCreated: PermissionsResponse = validateAndParse(
      PermissionsResponseParser,
      response.data
    );
    this.generateDataSetPermissions(permissionsCreated.data.permissions);
    return permissionsCreated;
  }

  public async removeAccess(requestBody: { permission: DataSetPermission }): Promise<PermissionsResponse> {
    let routeId: string;
    if (requestBody.permission.identityType === 'GROUP') {
      routeId = 'roles';
    } else if (requestBody.permission.identityType === 'USER') {
      routeId = 'users';
    } else {
      throw new Error('identity type must be "USER" or "GROUP"');
    }
    const response: AxiosResponse = await this._axiosInstance.delete(
      `${this._api}/permissions/${routeId}/${requestBody.permission.identity}`,
      {
        data: { accessLevel: requestBody.permission.accessLevel }
      }
    );
    const permissionsDeleted: PermissionsResponse = validateAndParse(
      PermissionsResponseParser,
      response.data
    );

    return permissionsDeleted;
  }

  public async share(
    requestBody: {
      externalEndpointName?: string;
      externalRoleName?: string;
      kmsKeyArn?: string;
      vpcId?: string;
      groupId?: string;
      userId?: string;
    } = {}
  ): Promise<AxiosResponse> {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    // note: endpoint will be created as S3 access point which MUST begin with a lower case letter.
    const endPointName =
      requestBody.externalEndpointName ?? `ap-${randomTextGenerator.getFakeText('test-EP').toLowerCase()}`;

    const response: AxiosResponse = await this._axiosInstance.post(`${this._api}/share`, {
      externalEndpointName: endPointName,
      externalRoleName: requestBody.externalRoleName,
      kmsKeyArn: requestBody.kmsKeyArn,
      vpcId: requestBody.vpcId,
      groupId: requestBody.groupId,
      userId: requestBody.userId
    });

    const endPointParams: EndpointCreateParams = {
      id: response.data.endpointId,
      clientSession: this._clientSession,
      parentApi: this._api,
      awsAccountId: this._awsAccountId,
      externalEndpointName: endPointName
    };

    const taskid = `endpoint-${endPointParams.id}`;
    const resourceNode: Endpoint = this.endpoint(endPointParams);
    this._children.set(resourceNode.id, resourceNode);

    this._clientSession.addCleanupTask({ id: taskid, task: async () => resourceNode.cleanup() });

    return response;
  }

  public async generateSinglePartFileUploadUrl(body: { fileName: string }): Promise<AxiosResponse> {
    return await this._axiosInstance.post(`${this._api}/presignedUpload`, body);
  }

  public async cleanup(): Promise<void> {
    try {
      // Delete DDB entries, and path folder from bucket (to prevent test resources polluting a prod env)
      const datasetHelper = new DatasetHelper();
      await datasetHelper.deleteS3Resources(this.storageName, this.storagePath);
      await datasetHelper.deleteDdbRecords(this.id);
    } catch (error) {
      console.warn(`Error caught in cleanup of dataset '${this.id}': ${error}.`);
    }
  }
}

export interface DataSetCreateParams {
  id: string;
  clientSession: ClientSession;
  parentApi: string;
  awsAccountId: string;
  storageName: string;
  storagePath: string;
}
