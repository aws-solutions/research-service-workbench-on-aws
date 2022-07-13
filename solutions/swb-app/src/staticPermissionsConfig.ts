import { Permission, PermissionsMap } from '@amzn/workbench-core-authorization';

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
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
    subject: 'Environment'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'User'
  }
];

const adminPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'Account'
  },
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
  },
  {
    effect: 'ALLOW',
    action: 'DELETE',
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
    subject: 'sampleRole-sampleUser'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'User'
  },
  {
    effect: 'ALLOW',
    action: 'CREATE',
    subject: 'User'
  }
];

export const permissionsMap: PermissionsMap = {
  Researcher: researcherPermissions,
  Admin: adminPermissions
};
