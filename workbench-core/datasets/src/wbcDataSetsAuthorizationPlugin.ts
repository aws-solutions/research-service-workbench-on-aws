/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateIdentityPermissionsResponse,
  DynamicAuthorizationService,
  Effect,
  IdentityType,
  IdentityPermission,
  DeleteIdentityPermissionsResponse
} from '@aws/workbench-core-authorization';
import _ from 'lodash';
import { DataSetsAuthorizationPlugin, dataSetSubjectType } from './dataSetsAuthorizationPlugin';
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
    const identityPermissions: IdentityPermission[] = this._dataSetPermissionToIdentityPermissions(params);
    const createdPermission: CreateIdentityPermissionsResponse =
      await this._authorizer.createIdentityPermissions({
        authenticatedUser: params.authenticatedUser,
        identityPermissions
      });

    const permissions: PermissionsResponse[] = this._identityPermissionsToPermissionsResponse(
      createdPermission.data.identityPermissions
    );

    if (_.isEmpty(permissions)) {
      throw new InvalidPermissionError('No permissions found.');
    }

    const permissionsCount = permissions.length;

    if (permissionsCount !== 1) {
      throw new InvalidPermissionError(
        `Expected a single permissions response, but got ${permissionsCount}.`
      );
    }

    return permissions[0];
  }

  public async getAccessPermissions(params: GetAccessPermissionRequest): Promise<PermissionsResponse> {
    if (params.identityType !== 'GROUP' && params.identityType !== 'USER') {
      throw new InvalidPermissionError("IdentityType must be 'GROUP' or 'USER'.");
    }
    const identityResponse = await this._authorizer.getIdentityPermissionsBySubject({
      subjectId: params.dataSetId,
      subjectType: dataSetSubjectType,
      identities: [
        {
          identityId: params.identity,
          identityType: params.identityType
        }
      ]
    });
    const identityPermissions = _.filter(
      identityResponse.data.identityPermissions,
      (v: IdentityPermission) => v.action === 'READ' || v.action === 'UPDATE'
    );
    const permissionsResponse = this._identityPermissionsToPermissionsResponse(identityPermissions);

    const permissionsCount = permissionsResponse.length;
    if (permissionsCount > 1) {
      throw new InvalidPermissionError(
        `Expected a single permissions response, but got ${permissionsCount}.`
      );
    }

    if (_.isEmpty(permissionsResponse)) {
      return {
        data: {
          dataSetId: params.dataSetId,
          permissions: []
        }
      };
    }
    return permissionsResponse[0];
  }

  public async removeAccessPermissions(
    params: AddRemoveAccessPermissionRequest
  ): Promise<PermissionsResponse> {
    const identityPermissions: IdentityPermission[] = this._dataSetPermissionToIdentityPermissions(params);
    const removedPermissions: DeleteIdentityPermissionsResponse =
      await this._authorizer.deleteIdentityPermissions({
        authenticatedUser: params.authenticatedUser,
        identityPermissions
      });
    const permissions: PermissionsResponse[] = this._identityPermissionsToPermissionsResponse(
      removedPermissions.data.identityPermissions
    );
    const permissionsCount = permissions.length;

    if (permissionsCount !== 1) {
      throw new InvalidPermissionError(
        `Expected a single permissions response, but got ${permissionsCount}.`
      );
    }

    return permissions[0];
  }

  public async getAllDataSetAccessPermissions(
    datasetId: string,
    pageToken?: string
  ): Promise<PermissionsResponse> {
    const identityResponse = await this._authorizer.getIdentityPermissionsBySubject({
      subjectId: datasetId,
      subjectType: dataSetSubjectType,
      paginationToken: pageToken
    });
    const identityPermissions = _.filter(
      identityResponse.data.identityPermissions,
      (v: IdentityPermission) => v.action === 'READ' || v.action === 'UPDATE'
    );
    const permissionsResponse = this._identityPermissionsToPermissionsResponse(identityPermissions);
    const permissionsCount = permissionsResponse.length;
    if (permissionsCount > 1) {
      throw new InvalidPermissionError(
        `Expected a single permissions response, but got ${permissionsCount}.`
      );
    }

    if (_.isEmpty(permissionsResponse)) {
      return {
        data: {
          dataSetId: datasetId,
          permissions: []
        },
        pageToken: identityResponse.paginationToken
      };
    }
    permissionsResponse[0].pageToken = identityResponse.paginationToken;
    return permissionsResponse[0];
  }

  public async removeAllAccessPermissions(datasetId: string): Promise<PermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  private _dataSetPermissionToIdentityPermissions(
    dataSetPermissions: AddRemoveAccessPermissionRequest
  ): IdentityPermission[] {
    const requestPermssions = _.isArray(dataSetPermissions.permission)
      ? dataSetPermissions.permission
      : [dataSetPermissions.permission];
    if (
      _.some(
        requestPermssions,
        (p: DataSetPermission) => p.accessLevel !== 'read-only' && p.accessLevel !== 'read-write'
      )
    ) {
      throw new InvalidPermissionError("Access Level must be 'read-only' or 'read-write'.");
    }

    if (
      _.some(
        requestPermssions,
        (p: DataSetPermission) => p.identityType !== 'GROUP' && p.identityType !== 'USER'
      )
    ) {
      throw new InvalidPermissionError("IdentityType must be 'GROUP' or 'USER'.");
    }

    const identityPermissions: IdentityPermission[] = [];
    const permissionsEffect: Effect = 'ALLOW';
    requestPermssions.map((p: DataSetPermission) => {
      const identityType: IdentityType = p.identityType === 'GROUP' ? 'GROUP' : 'USER';

      identityPermissions.push({
        identityType: identityType,
        identityId: p.identity,
        action: 'READ',
        effect: permissionsEffect,
        subjectType: 'DataSet',
        subjectId: dataSetPermissions.dataSetId,
        description: `'${p.accessLevel}' access on DataSet '${dataSetPermissions.dataSetId}'`
      });
      if (p.accessLevel === 'read-write') {
        identityPermissions.push({
          identityType: identityType,
          identityId: p.identity,
          action: 'UPDATE',
          effect: permissionsEffect,
          subjectType: 'DataSet',
          subjectId: dataSetPermissions.dataSetId,
          description: `'read-write' access on DataSet '${dataSetPermissions.dataSetId}'`
        });
      }
    });

    return identityPermissions;
  }

  private _identityPermissionsToPermissionsResponse(
    dataSetIdentityPermissions: IdentityPermission[]
  ): PermissionsResponse[] {
    const permissions: PermissionsResponse[] = [];

    // validate
    if (_.isEmpty(dataSetIdentityPermissions)) {
      // return the empty array if there is nothing to do.
      return permissions;
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
