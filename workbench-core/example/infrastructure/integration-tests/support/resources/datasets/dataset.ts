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
import Endpoint from './endpoint';

export default class Dataset extends Resource {
  private _awsAccountId: string;
  private _permissions: Map<string, IdentityPermission>;
  public storageName: string;
  public storagePath: string;
  public owner?: string;
  public ownerType?: string;
  public children: Map<string, Endpoint>;

  public constructor(params: DataSetCreateParams) {
    super(params.clientSession, 'dataset', params.id, params.parentApi);
    this._awsAccountId = params.awsAccountId;
    this.storageName = params.storageName;
    this.storagePath = params.storagePath;
    this.children = new Map<string, Endpoint>();
    this._permissions = new Map<string, IdentityPermission>();
    this.owner = params.owner;
    this.ownerType = params.ownerType;
  }

  public identityPermission(
    identityPermission: Permission,
    clientSession: ClientSession,
    parentApi: string,
    id: string
  ): IdentityPermission {
    return new IdentityPermission(identityPermission, clientSession, parentApi, id);
  }

  public endpoint(params: EndpointCreateRequest): Endpoint {
    return new Endpoint({
      ...params,
      clientSession: this._clientSession,
      parentApi: `${this._api}/share`,
      awsAccountId: this._awsAccountId
    });
  }

  public async getAllAccess(query?: Record<string, string>): Promise<PermissionsResponse> {
    const response: AxiosResponse = await this._axiosInstance.get(`${this._api}/permissions`, {
      params: query
    });
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
      region?: string;
      roleToAssume?: string;
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
      userId: requestBody.userId,
      region: requestBody.region,
      roleToAssume: requestBody.roleToAssume
    });

    const endPointParams: EndpointCreateRequest = {
      id: response.data.mountObject.endpointId,
      externalEndpointName: endPointName
    };

    const taskid = `endpoint-${endPointParams.id}`;
    const resourceNode: Endpoint = this.endpoint(endPointParams);
    this.children.set(resourceNode.id, resourceNode);

    this._clientSession.addCleanupTask({ id: taskid, task: async () => resourceNode.cleanup() });

    return response;
  }

  public async generateSinglePartFileUploadUrl(body: {
    fileName: string;
    region?: string;
    roleToAssume?: string;
  }): Promise<AxiosResponse> {
    return await this._axiosInstance.post(`${this._api}/presignedUpload`, body);
  }

  public async cleanup(): Promise<void> {
    const mainAwsService = this._setup.getMainAwsClient('ExampleDataSetDDBTableName');

    try {
      // Delete path folder from bucket
      const hostAwsService = await this._setup.getHostAwsClient('Main-Account-Cleanup-DataSet');
      const awsService =
        this._awsAccountId === this._settings.get('HostingAccountId') ? hostAwsService : mainAwsService;
      await DatasetHelper.deleteS3Resources(awsService, this.storageName, this.storagePath);
    } catch (error) {
      console.warn(`Error caught in cleanup of S3 bucket for dataset '${this.id}': ${error}.`);
    }

    try {
      // Delete DDB entries
      await DatasetHelper.deleteDdbRecords(mainAwsService, this.id);
    } catch (error) {
      console.warn(`Error caught in cleanup of DDB recored for dataset '${this.id}': ${error}.`);
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
  owner?: string;
  ownerType?: string;
}

interface EndpointCreateRequest {
  id: string;
  externalEndpointName: string;
}
