/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { DataSetsAccessLevel } from './models/dataSetsAccessLevel';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { PermissionsResponse } from './models/permissionsResponse';

export const dataSetSubjectType: string = 'Dataset';

/**
 * Defines the contract between DataSets and an Authorization Service
 */
export interface DataSetsAuthorizationPlugin {
  /**
   *
   * @param params - an {@link AddRemoveAccessPermissionRequest} object which includes the
   * `dataSetId`, the `subject` to whom access is granted, and the `accessLevel`.
   *
   * @returns the permissions added to the dataset.
   */
  addAccessPermission(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;

  /**
   * Gets the access granted if any to a particular user or group on the given dataset.
   *
   * @param params - a {@link GetAccessPermissionRequest} object containing the `dataSetId` for
   * the given dataset, and the `subject` indicating the user or group for which permissions are sought.
   *
   * @returns the access control permissions defined for the given datset and user or group.
   */
  getAccessPermissions(params: GetAccessPermissionRequest): Promise<PermissionsResponse>;

  /**
   * Remove the specified access permission from the dataset.
   *
   * @param params - an {@link AddRemoveAccessPermissionRequest} object containing the `dataSetId` for
   * the dataset to update, the `subject` indicating the user or group for which permission is
   * to be removed, and the `accessLevel` (read-only or read-write) to revoke.
   *
   * @returns a {@link PermissionsResponse} object indicating the permission removed.
   */
  removeAccessPermissions(params: AddRemoveAccessPermissionRequest): Promise<PermissionsResponse>;

  /**
   * Return all access permissions associated with a given dataset.
   *
   * @param datasetId - the ID of the dataset for which permissions should be retrieved.
   * @param pageToken - an optional token indicating the start point of the returned values.
   * @param pageSize - an optional number indicating the number of permissions returned.
   * @returns a {@link PermissionsResponse} object containing the permissions associated with the dataset.
   */
  getAllDataSetAccessPermissions(
    datasetId: string,
    pageToken?: string,
    pageSize?: number
  ): Promise<PermissionsResponse>;

  /**
   * Remove all permssions from a given dataset.
   * @param datasetId - the ID of the datset for which permissions are to be removed.
   * @param authenticatedUser - an object representing the user making the request.
   * @returns a {@link PermissionsResponse} indicating the permissions removed.
   */
  removeAllAccessPermissions(
    datasetId: string,
    authenticatedUser: { id: string; roles: string[] }
  ): Promise<PermissionsResponse>;
  /**
   * Checks whether the authenticated user is authorized to access the dataset with the defined {@link DataSetsAccessLevel}
   *
   * @param dataSetId - the ID of the dataset to check
   * @param accessLevel - the {@link DataSetsAccessLevel} to check authorization on
   * @param authenticatedUser - the user to check for authorization
   *
   * @throws - {@link ForbiddenError} when the user is not authorized.
   */
  isAuthorizedOnDataSet(
    dataSetId: string,
    accessLevel: DataSetsAccessLevel,
    authenticatedUser: { id: string; roles: string[] }
  ): Promise<void>;
}
