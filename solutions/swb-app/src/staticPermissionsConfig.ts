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
    action: 'READ',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'UPDATE',
    subject: 'Environment'
  }
];

export const permissionsMap: PermissionsMap = {
  Admin: adminPermissions,
  Researcher: researcherPermissions
};
