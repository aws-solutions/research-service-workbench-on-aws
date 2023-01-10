/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateIdentityPermissionsResponse,
  DynamicAuthorizationService,
  Effect,
  IdentityType,
  IdentityPermission
} from '@aws/workbench-core-authorization';
import _ from 'lodash';
import { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
import { InvalidPermissionError } from './errors/invalidPermissionError';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { DataSetPermission } from './models/dataSetPermission';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { PermissionsResponse } from './models/permissionsResponse';

export class WbcDataSetsAuthorizationPlugin implements DataSetsAuthorizationPlugin {
  private _authorizer: DynamicAuthorizationService;

  public constructor(authorizer: DynamicAuthorizationService) {
    this._authorizer = authorizer;
  }

  public async addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse> {
    if (params.permission.accessLevel !== 'read-only' && params.permission.accessLevel !== 'read-write') {
      throw new InvalidPermissionError("Access Level must be 'read-only' or 'read-write'.");
    }

    if (params.permission.identityType !== 'GROUP' && params.permission.identityType !== 'USER') {
      throw new InvalidPermissionError("IdentityType must be 'GROUP' or 'USER'.");
    }

    const permissionsEffect: Effect = 'ALLOW';
    const identityType: IdentityType = params.permission.identityType === 'GROUP' ? 'GROUP' : 'USER';

    const identityPermissions: IdentityPermission[] = [
      {
        identityType: identityType,
        identityId: params.permission.identity,
        action: 'READ',
        effect: permissionsEffect,
        subjectType: 'DataSet',
        subjectId: params.dataSetId,
        description: `'${params.permission.accessLevel}' access on DataSet '${params.dataSetId}'`
      }
    ];
    if (params.permission.accessLevel === 'read-write') {
      identityPermissions.push({
        identityType: identityType,
        identityId: params.permission.identity,
        action: 'UPDATE',
        effect: permissionsEffect,
        subjectType: 'DataSet',
        subjectId: params.dataSetId,
        description: "'read-write' access on DataSet '${params.dataSetId}'"
      });
    }
    const createdPermission: CreateIdentityPermissionsResponse =
      await this._authorizer.createIdentityPermissions({
        authenticatedUser: params.authenticatedUser,
        identityPermissions
      });

    const permissions: PermissionsResponse[] = this._identityPermissionsToPermissionsResponse(
      createdPermission.data.identityPermissions
    );
    const permissionsCount = permissions.length;

    if (permissionsCount !== 1) {
      throw new InvalidPermissionError(
        `Expected a single permissions response, but got ${permissionsCount}.`
      );
    }

    return permissions[0];
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

  private _identityPermissionsToPermissionsResponse(
    dataSetIdentityPermissions: IdentityPermission[]
  ): PermissionsResponse[] {
    const permissions: PermissionsResponse[] = [];

    // validate
    if (_.isEmpty(dataSetIdentityPermissions)) {
      throw new InvalidPermissionError('No permissions found.');
    } else if (
      _.some(
        dataSetIdentityPermissions,
        (i: IdentityPermission) => i.action !== 'READ' && i.action !== 'UPDATE'
      )
    ) {
      throw new InvalidPermissionError(
        "Unsupported actions found in permissions. Only 'READ' and 'UPDATE' are currently supported."
      );
    } else if (_.some(dataSetIdentityPermissions, (i: IdentityPermission) => i.effect !== 'ALLOW')) {
      throw new InvalidPermissionError("Only 'ALLOW' effect is supported.");
    }

    dataSetIdentityPermissions.map((i: IdentityPermission) => {
      const dataSetPermissions: PermissionsResponse | undefined = _.find(
        permissions,
        (p: PermissionsResponse) => p.data.dataSetId === i.subjectId
      );
      if (!dataSetPermissions) {
        // dataset has not yet been encountered. Add it.
        permissions.push({
          data: {
            dataSetId: i.subjectId,
            permissions: [
              {
                identity: i.identityId,
                identityType: i.identityType,
                accessLevel: i.action === 'UPDATE' ? 'read-write' : 'read-only'
              }
            ]
          }
        });
      } else {
        // the dataset was found, but this identity is new. Add it.
        const permission: DataSetPermission | undefined = _.find(
          dataSetPermissions.data.permissions,
          (p: DataSetPermission) => p.identity === i.identityId && p.identityType === i.identityType
        );
        if (!permission) {
          dataSetPermissions.data.permissions.push({
            identity: i.identityId,
            identityType: i.identityType,
            accessLevel: i.action === 'UPDATE' ? 'read-write' : 'read-only'
          });
        } else if (permission.accessLevel === 'read-only' && i.action === 'UPDATE') {
          // the idenity already exists on the dataset.
          // expect to get both a 'READ' and an 'UPDATE' action for 'read-write'.
          // the 'READ' is effectively ignored here in favor of the 'read-write' for 'UPDATE'.
          permission.accessLevel = 'read-write';
        }
      }
    });

    return permissions;
  }
}
