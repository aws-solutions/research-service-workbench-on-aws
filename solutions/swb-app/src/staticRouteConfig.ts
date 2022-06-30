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
  '/pro': {
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
  '/login': {
    GET: true
  },
  '/token': {
    POST: true
  },
  '/logout': {
    GET: true
  },
  '/refresh': {
    GET: true
  },
  '/loggedIn': {
    GET: true
  },

  // TODO: Ignoring these routes right now, but eventually will need to send token in Authorization header and validate
  '/environments': {
    GET: true
  }
};
