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
    action: 'READ',
    subject: 'AuthorizationUser'
  }
];

export const permissionsMap: PermissionsMap = {
  Admin: adminPermissions
};
