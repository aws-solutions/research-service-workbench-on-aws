/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Permission, PermissionsMap } from '@aws/workbench-core-authorization';

const adminPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Account'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Account'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Account'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'AccountTemplate'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'CostCenter'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'CostCenter'
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
    subject: 'CostCenter'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'CostCenter'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'CostCenter'
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
    subject: 'CostCenter'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'CostCenter'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'CostCenter'
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
    action: 'DELETE',
    subject: 'EnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Project'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Project'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Project'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
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
    subject: 'AssignUserToProject'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'AssignUserToProject'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'ProjectEnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'ProjectEnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'ProjectEnvironmentTypeConfig'
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'KeyPair'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'KeyPair'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'ProjectDataSet'
  }
];

const researcherPermissions: Permission[] = [
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
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'KeyPair'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'KeyPair'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'ProjectDataSet'
  }
];

export const permissionsMap: PermissionsMap = {
  Admin: adminPermissions,
  ITAdmin: adminPermissions,
  Researcher: researcherPermissions
};
