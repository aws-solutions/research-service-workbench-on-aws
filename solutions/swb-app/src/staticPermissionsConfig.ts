/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Permission, PermissionsMap } from '@amzn/workbench-core-authorization';

const adminPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Account'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'EnvironmentConnection'
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
    action: 'CREATE',
    subject: 'EnvironmentType'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'EnvironmentType'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'EnvironmentType'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'EnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'EnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'EnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Project'
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
    action: 'CREATE',
    subject: 'User'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'User'
  }
];

const researcherPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Environment'
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
    action: 'READ',
    subject: 'EnvironmentConnection'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'EnvironmentType'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'EnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Project'
  }
];

export const permissionsMap: PermissionsMap = {
  Admin: adminPermissions,
  Researcher: researcherPermissions
};
