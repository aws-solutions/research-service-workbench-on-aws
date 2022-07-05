import { RoutesIgnored, RoutesMap } from '@amzn/workbench-core-authorization';

export const routesMap: RoutesMap = {
  '/environments': {
    DELETE: [
      {
        action: 'DELETE',
        subject: 'Environment'
      }
    ],
    GET: [
      {
        action: 'READ',
        subject: 'Environment'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'Environment'
      }
    ],
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  '/user': {
    POST: [
      {
        action: 'CREATE',
        subject: 'User'
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
  },
  '/user': {
    POST: true
  }
};
