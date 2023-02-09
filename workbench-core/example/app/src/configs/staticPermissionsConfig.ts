/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Permission, PermissionsMap } from '@aws/workbench-core-authorization';

const adminPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Example'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Dataset'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Dataset'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Dataset'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'Dataset'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'DatasetAccess'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'DatasetAccess'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'DatasetAccess'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Storage'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Endpoint'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'Endpoint'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'DatasetRole'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'DatasetRole'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'DatasetFile'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'DatasetMountObject'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Role'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Role'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Role'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'Role'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'User'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'User'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'User'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'User'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'AuthorizationGroup'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'IdentityPermission'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'AuthorizationGroup'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'AuthorizationGroup'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'AuthorizationGroup'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'AuthorizationUser'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'IdentityPermission'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'IdentityPermission'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Routes'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Subject'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'staticSampleRoutes'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'staticSampleRouteParam'
  },
  {
    effect: 'DENY',
    action: 'UPDATE',
    subject: 'staticSampleRoutes'
  },
  {
    effect: 'DENY',
    action: 'DELETE',
    subject: 'staticSampleRoutes'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'staticSampleRoutes'
  }
];

export const permissionsMap: PermissionsMap = {
  Admin: adminPermissions
};
