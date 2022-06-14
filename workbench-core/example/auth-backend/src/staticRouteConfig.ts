import { RoutesIgnored, RoutesMap } from '@amzn/workbench-core-authorization';

export const routesMap: RoutesMap = {
  '/guest': {
    GET: [
      {
        action: 'READ',
        subject: 'Guest'
      }
    ]
  },
  '/admin': {
    GET: [
      {
        action: 'READ',
        subject: 'Admin'
      }
    ]
  }
};

export const routesIgnored: RoutesIgnored = {
  '/unprotected': {
    GET: true
  }
};
