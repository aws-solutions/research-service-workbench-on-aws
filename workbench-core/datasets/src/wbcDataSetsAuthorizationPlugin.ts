/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DynamicAuthorizationService } from '@aws/workbench-core-authorization';
import { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { PermissionsResponse } from './models/permissionsResponse';

export class WbcDataSetsAuthorizationPlugin implements DataSetsAuthorizationPlugin {
  private _authorizer: DynamicAuthorizationService;

  public constructor(authorizer: DynamicAuthorizationService) {
    this._authorizer = authorizer;
  }

  public async addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse> {
    throw new Error('Method not implemented.');
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
