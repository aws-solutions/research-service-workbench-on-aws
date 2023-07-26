/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import Role from './role';

export default class Roles extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'roles', 'role');
    this._api = 'roles';
  }

  public role(id: string): Role {
    return new Role(id, this._clientSession, this._api);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async create(body: any = {}, applyDefault: boolean = true): Promise<AxiosResponse> {
    // Because of the cleanup logic, before we do the create, we need to ensure that the extender of this collection
    // resource class has a method that returns the resource operations helper for the child resource.
    // For example, if the extender class is 'Users' and it provides childType = 'user', then Users class must have
    // a method called 'user()'.
    const requestBody = applyDefault ? this._buildDefaults(body) : body;
    const response: AxiosResponse = await this._axiosInstance.post(this._api, requestBody);

    const taskId = `${this._childType}-${requestBody.roleName}`;
    const resourceNode = this.role(requestBody.roleName);
    this.children.set(resourceNode.id, resourceNode);
    // We add a cleanup task to the cleanup queue for the session
    this._clientSession.addCleanupTask({ id: taskId, task: async () => resourceNode.cleanup() });

    return response;
  }

  protected _buildDefaults(resource: CreateRoleRequest): CreateRoleRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    const roleName = randomTextGenerator.getFakeText('test-user-role');

    return {
      roleName: resource.roleName ?? roleName
    };
  }
}

interface CreateRoleRequest {
  roleName: string;
}
