import { Permission, PermissionsMap } from '@amzn/workbench-core-authorization';

const guestPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Guest'
  }
];

const adminPermissions: Permission[] = [
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Admin'
  },
  {
    effect: 'ALLOW',
    action: 'READ',
    subject: 'Guest'
  }
];

export const permissionsMap: PermissionsMap = {
  Guest: guestPermissions,
  Admin: adminPermissions
};
