import { RoutesIgnored, RoutesMap } from '@amzn/workbench-core-authorization';

export const routesMap: RoutesMap = {
  '/environments': {
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
    ]
  },
  '/environments/*': {
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
    ]
  },
  '/environments/*/start': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  '/environments/*/stop': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Environment'
      }
    ]
  },
  '/roles': {
    POST: [
      {
        action: 'CREATE',
        subject: 'Role'
      }
    ]
  },
  '/users': {
    GET: [
      {
        action: 'READ',
        subject: 'User'
      }
    ],
    POST: [
      {
        action: 'CREATE',
        subject: 'User'
      }
    ]
  },
  '/roles/Researcher': {
    PUT: [
      {
        action: 'UPDATE',
        subject: 'Role'
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
    GET: true,
    POST: true
  },
  '/environments/*': {
    GET: true,
    DELETE: true
  },
  '/environments/*/start': {
    PUT: true
  },
  '/environments/*/stop': {
    PUT: true
  },
  '/users': {
    GET: true,
    POST: true
  },
  '/roles': {
    POST: true
  },
  '/roles/Researcher': {
    PUT: true
  },
  '/aws-accounts': {
    POST: true
  }
};
