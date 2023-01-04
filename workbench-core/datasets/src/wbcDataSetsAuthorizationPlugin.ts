/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  Action,
  CreateIdentityPermissionsResponse,
  DynamicAuthorizationService,
  Effect,
  IdentityType
} from '@aws/workbench-core-authorization';
import { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
import { InvalidPermissionError } from './errors/invalidPermissionError';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { DataSetPermission } from './models/dataSetPermission';
import { DataSetsAccessLevel } from './models/dataSetsAccessLevel';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { PermissionsResponse } from './models/permissionsResponse';

export class WbcDataSetsAuthorizationPlugin implements DataSetsAuthorizationPlugin {
  private _authorizer: DynamicAuthorizationService;

  public constructor(authorizer: DynamicAuthorizationService) {
    this._authorizer = authorizer;
  }

  public async addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse> {
    if (params.permission.accessLevel !== 'read-only' && params.permission.accessLevel !== 'read-write') {
      throw new InvalidPermissionError('Access Level must be "read-only" or "read-write".');
    }

    if (params.permission.identityType !== 'GROUP' && params.permission.identityType !== 'USER') {
      throw new InvalidPermissionError('IdentityType just be "GROUP" or "USER".');
    }

    const permissionsEffect: Effect = 'ALLOW';
    const permissionsAction: Action = params.permission.accessLevel === 'read-only' ? 'READ' : 'UPDATE';
    const subjectType: IdentityType = params.permission.identityType === 'GROUP' ? 'GROUP' : 'USER';

    const createdPermission: CreateIdentityPermissionsResponse =
      await this._authorizer.createIdentityPermissions({
        authenticatedUser: {
          id: params.authenticatedUserId,
          roles: params.roles
        },
        identityPermissions: [
          {
            identityType: subjectType,
            identityId: params.permission.identity,
            action: permissionsAction as Action,
            effect: permissionsEffect as Effect,
            subjectType: 'DataSet',
            subjectId: params.dataSetId,
            description: `${params.permission.accessLevel} on DataSet ${params.dataSetId}`
          }
        ]
      });

    const newPermissions: DataSetPermission[] = createdPermission.data.identityPermissions.map((i) => {
      const accessLevel: DataSetsAccessLevel = i.action === 'READ' ? 'read-only' : 'read-write';
      return {
        identity: i.identityId,
        identityType: i.identityType,
        accessLevel: accessLevel
      };
    });

    return {
      data: {
        dataSetId: createdPermission.data.identityPermissions[0].subjectId,
        permissions: newPermissions
      }
    };
  }

  public async getAccessPermissions(params: GetAccessPermissionRequest): Promise<PermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  public async removeAccessPermissions(
    params: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  public async getAllDataSetAccessPermissions(datasetId: string): Promise<PermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  public async removeAllAccessPermissions(datasetId: string): Promise<PermissionsResponse> {
    throw new Error('Method not implemented.');
  }
}
